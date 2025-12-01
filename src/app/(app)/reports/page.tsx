'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, storage } from '@/firebase';
import { addReport, getReports, deleteReport, saveAnalysis, type Report } from '@/firebase/firestore/reports';
import { Loader2, Upload, FileText, Trash2, Sparkles, Image as ImageIcon, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

export default function ReportsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [reports, setReports] = useState<Report[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState('');

    // Analysis State
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user && firestore) {
            const unsubscribe = getReports(firestore, user.uid, (data) => {
                setReports(data);
                setIsLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user, firestore]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user || !firestore) return;

        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage) {
            toast({
                title: "Invalid file type",
                description: "Please upload PDF, JPG, or PNG files.",
                variant: "destructive"
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast({
                title: "File too large",
                description: "Maximum file size is 10MB.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        setStatusMessage('Reading file...');

        try {
            // 1. Read file as Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64Data = reader.result as string;

                setStatusMessage('Analyzing with AI...');

                // 2. Send to API for analysis
                const response = await fetch('/api/analyze-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileData: base64Data,
                        mimeType: file.type
                    }),
                });

                if (!response.ok) throw new Error('Analysis failed');
                const analysisData = await response.json();

                setStatusMessage('Saving results...');

                // 3. Save metadata and analysis to Firestore
                await addReport(firestore, user.uid, {
                    name: file.name,
                    type: isPdf ? 'pdf' : 'image',
                    analysis: analysisData // Save analysis directly!
                });

                setAnalysisResult(analysisData); // Show result immediately

                toast({
                    title: "Analysis Complete",
                    description: "Your report has been analyzed and saved.",
                });

                setIsProcessing(false);
                setStatusMessage('');
            };

            reader.onerror = () => {
                throw new Error('Failed to read file');
            };

        } catch (error) {
            console.error("Process error:", error);
            toast({
                title: "Error",
                description: "Could not analyze the report.",
                variant: "destructive"
            });
            setIsProcessing(false);
            setStatusMessage('');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const handleDownloadPDF = () => {
        if (!analysisResult) return;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPos = 20;
            const lineHeight = 5;

            // Helper for page breaks
            const checkPageBreak = (height: number) => {
                if (yPos + height > pageHeight - margin) {
                    doc.addPage();
                    yPos = 20;
                }
            };

            // Helper to strip markdown
            const cleanText = (text: string) => {
                return text
                    .replace(/\*\*/g, '') // Remove bold
                    .replace(/##/g, '')   // Remove headers
                    .replace(/__/g, '')   // Remove italics
                    .trim();
            };

            // Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(10, 29, 66);
            doc.text("Medical Analysis Report", margin, yPos);
            yPos += 10;

            // Metadata
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, margin, yPos);
            yPos += 15;

            // Summary Section
            checkPageBreak(30);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Summary", margin, yPos);
            yPos += 8;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(60);

            const summaryLines = analysisResult.summary.split('\n');
            summaryLines.forEach((line: string) => {
                const cleanedLine = cleanText(line);
                if (!cleanedLine) return;

                if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                    const bulletText = cleanedLine.replace(/^[\*\-]\s*/, '');
                    const wrappedBullet = doc.splitTextToSize(bulletText, pageWidth - (margin * 2) - 10);

                    checkPageBreak(wrappedBullet.length * lineHeight);
                    doc.circle(margin + 3, yPos - 3, 1.5, 'F');
                    doc.text(wrappedBullet, margin + 10, yPos);
                    yPos += (wrappedBullet.length * lineHeight) + 2;
                } else {
                    const wrappedText = doc.splitTextToSize(cleanedLine, pageWidth - (margin * 2));
                    checkPageBreak(wrappedText.length * lineHeight);
                    doc.text(wrappedText, margin, yPos);
                    yPos += (wrappedText.length * lineHeight) + 4;
                }
            });
            yPos += 5;

            // Key Findings Section
            checkPageBreak(30);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Key Findings", margin, yPos);
            yPos += 8;

            analysisResult.keyFindings.forEach((finding: any) => {
                checkPageBreak(20);

                doc.setFillColor(finding.status === 'CRITICAL' ? 239 : finding.status === 'ABNORMAL' ? 245 : 34,
                    finding.status === 'CRITICAL' ? 68 : finding.status === 'ABNORMAL' ? 158 : 197,
                    finding.status === 'CRITICAL' ? 68 : finding.status === 'ABNORMAL' ? 11 : 94);
                doc.circle(margin + 2, yPos - 3, 2, 'F');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0);
                doc.text(`${cleanText(finding.parameter)}: ${cleanText(finding.value)}`, margin + 10, yPos);

                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`[${finding.status}]`, pageWidth - margin - 30, yPos, { align: 'right' });
                yPos += 5;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(80);
                const interpretationLines = doc.splitTextToSize(cleanText(finding.interpretation), pageWidth - (margin * 2) - 10);
                doc.text(interpretationLines, margin + 10, yPos);
                yPos += (interpretationLines.length * lineHeight) + 6;
            });
            yPos += 5;

            // Recommendations Section
            checkPageBreak(30);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Recommendations", margin, yPos);
            yPos += 8;

            analysisResult.recommendations.forEach((rec: string) => {
                const cleanedRec = cleanText(rec);
                checkPageBreak(15);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);
                doc.setTextColor(60);

                doc.circle(margin + 3, yPos - 3, 1.5, 'F');
                const recLines = doc.splitTextToSize(cleanedRec, pageWidth - (margin * 2) - 10);
                doc.text(recLines, margin + 10, yPos);
                yPos += (recLines.length * lineHeight) + 4;
            });

            // Footer
            const footerY = pageHeight - 10;
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text("Disclaimer: AI generated analysis. Consult a doctor for medical advice.", pageWidth / 2, footerY, { align: 'center' });

            doc.save(`${cleanText(analysisResult.summary).slice(0, 20).replace(/[^a-z0-9]/gi, '_')}_report.pdf`);

            toast({
                title: "Download Complete",
                description: "Your professional report is ready.",
            });
        } catch (error) {
            console.error("Download error:", error);
            toast({
                title: "Download Failed",
                description: "Could not generate PDF.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (report: Report) => {
        if (!user || !firestore) return;

        try {
            await deleteReport(firestore, storage, report);
            toast({
                title: "Report Deleted",
                description: "The report has been removed.",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: "Could not delete the report.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F5FF] dark:bg-[#0D1117] pt-6 px-4 pb-20 font-[Poppins] text-[#0A1D42] dark:text-[#F0F6FC]">

            {/* Analysis Result Modal */}
            {analysisResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-[#161B22] border-0 shadow-2xl rounded-3xl">
                        <CardHeader className="bg-white dark:bg-[#161B22] z-10 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black text-[#0A1D42] dark:text-[#F0F6FC] flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    AI Analysis Report
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownloadPDF}
                                        className="hidden md:flex"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setAnalysisResult(null)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto" id="analysis-content">
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">Summary</h3>
                                    <div className="text-blue-800 dark:text-blue-300 leading-relaxed prose prose-blue dark:prose-invert max-w-none">
                                        <ReactMarkdown>{analysisResult.summary}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Key Findings */}
                                <div>
                                    <h3 className="font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-4 text-lg">Key Findings</h3>
                                    <div className="grid gap-3">
                                        {analysisResult.keyFindings.map((finding: any, i: number) => (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                                                <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 shadow-sm ${finding.status === 'CRITICAL' ? 'bg-red-500 shadow-red-500/50' :
                                                    finding.status === 'ABNORMAL' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-green-500 shadow-green-500/50'
                                                    }`} />
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <span className="font-bold text-base">{finding.parameter}</span>
                                                        <span className="text-xs font-mono font-bold bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                                                            {finding.value}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                        {finding.interpretation}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div>
                                    <h3 className="font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-4 text-lg">Recommendations</h3>
                                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/20">
                                        <ul className="space-y-3">
                                            {analysisResult.recommendations.map((rec: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="bg-white dark:bg-black/20 p-1 rounded-full shrink-0 mt-0.5">
                                                        <Sparkles className="h-3 w-3 text-purple-500" />
                                                    </div>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 text-center pt-6 border-t border-gray-100 dark:border-gray-800">
                                    AI can make mistakes. Always consult a doctor for medical advice.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#0A1D42] dark:text-[#F0F6FC] leading-tight mb-2">
                            Medical <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Reports</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Upload lab results or photos to get instant AI insights.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessing}
                            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {statusMessage}
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Analyze New Report
                                </>
                            )}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="application/pdf,image/jpeg,image/png"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Loading your reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#161B22]/50 shadow-none py-12">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
                                    <FileText className="h-10 w-10 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#0A1D42] dark:text-[#F0F6FC] mb-2">No Reports Yet</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
                                    Upload your medical reports (PDF or Photos) to get AI-powered insights, summaries, and recommendations.
                                </p>
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl h-11 px-6">
                                    Analyze First Report
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        reports.map((report) => (
                            <Card key={report.id} className="group hover:shadow-lg transition-all border-gray-100 dark:border-gray-800 bg-white dark:bg-[#161B22] overflow-hidden rounded-2xl">
                                <div className="flex items-center p-5 gap-5">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${report.type === 'pdf' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                                        }`}>
                                        {report.type === 'pdf' ? <FileText className="h-7 w-7" /> : <ImageIcon className="h-7 w-7" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[#0A1D42] dark:text-[#F0F6FC] truncate text-lg mb-1">
                                            {report.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                            <span className="uppercase tracking-wider">{report.type}</span>
                                            <span>•</span>
                                            <span>{report.createdAt ? format(report.createdAt.toDate(), 'PPP') : 'Just now'}</span>
                                            {report.analysis && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3" /> Analyzed
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setAnalysisResult(report.analysis)}
                                            className="rounded-xl font-bold shadow-md transition-all bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0D1117] dark:text-gray-300 dark:border-gray-700"
                                        >
                                            <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                                            View Analysis
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                            onClick={() => handleDelete(report)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
