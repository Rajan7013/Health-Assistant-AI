import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from '../../src/lib/utils';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/auth';
import { db, storage } from '../../src/config/firebase'; // Import db and storage
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { addReport, getReports, deleteReport, Report } from '../../src/firebase/firestore/reports'; // Import Firestore helpers

// Types matching the web response
interface AnalysisResult {
    summary: string;
    keyFindings: {
        parameter: string;
        value: string;
        status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
        interpretation: string;
    }[];
    recommendations: string[];
}

export default function ReportsScreen() {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Subscribe to reports from Firestore
    useEffect(() => {
        if (!user) return;

        const unsubscribe = getReports(db, user.uid, (data) => {
            setReports(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            if (file.size && file.size > 10 * 1024 * 1024) {
                Alert.alert('File too large', 'Maximum file size is 10MB.');
                return;
            }

            processFile(file.uri, file.mimeType || 'application/pdf', file.name);

        } catch (error) {
            console.error('File selection error:', error);
            Alert.alert('Error', 'Could not select file.');
        }
    };

    const handleCameraUpload = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Camera permission is required to take photos of reports.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            processFile(file.uri, 'image/jpeg', `Photo_${Date.now()}.jpg`);

        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Could not take photo.');
        }
    };

    const processFile = async (uri: string, mimeType: string, name: string) => {
        if (!user) return;
        setUploading(true);
        try {
            // FIX: Use string literal 'base64' instead of FileSystem.EncodingType.Base64
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const fileData = `data:${mimeType};base64,${base64}`;
            const token = await user.getIdToken();

            // REPLACE WITH YOUR LOCAL IP
            const API_URL = 'https://health-assistant-ai-ashen.vercel.app/api/analyze-report';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fileData,
                    mimeType,
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const analysisData = await response.json();

            // Save to Firestore
            await addReport(db, user.uid, {
                name: name,
                type: mimeType.includes('pdf') ? 'pdf' : 'image',
                analysis: analysisData,
            });

            Alert.alert('Success', 'Report analyzed and saved!');

            // Note: We don't need to manually update state because the onSnapshot listener will do it.
            // But we can set the selected report to the one just created if we want to show it immediately.
            // For simplicity, we'll let the user select it from the list or just show a success message.

        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Analysis Failed', 'Could not analyze the report. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (report: Report) => {
        Alert.alert(
            "Delete Report",
            "Are you sure you want to delete this report?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteReport(db, storage, report);
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Failed to delete report.");
                        }
                    }
                }
            ]
        );
    };

    // Helper to format date safely
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        // Handle Firestore Timestamp
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        // Handle Date object
        if (timestamp instanceof Date) return timestamp.toLocaleDateString();
        // Handle number/string
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-slate-50`}>
            <ScrollView contentContainerStyle={tw`p-6 pb-24`}>
                {/* Header */}
                <View style={tw`mb-6 mt-4`}>
                    <Text style={tw`text-3xl font-bold text-slate-900`}>Medical <Text style={tw`text-blue-600`}>Reports</Text></Text>
                    <Text style={tw`text-slate-500 mt-1`}>Upload lab results for AI analysis</Text>
                </View>

                {/* Actions */}
                <View style={tw`flex-row gap-4 mb-8`}>
                    <TouchableOpacity
                        onPress={handleFileUpload}
                        disabled={uploading}
                        style={tw`flex-1 bg-blue-600 rounded-2xl p-4 items-center justify-center shadow-lg shadow-blue-500/30`}
                    >
                        {uploading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <View style={tw`bg-white/20 p-2 rounded-full mb-2`}>
                                    <Ionicons name="cloud-upload" size={24} color="white" />
                                </View>
                                <Text style={tw`text-white font-bold`}>Upload File</Text>
                                <Text style={tw`text-blue-100 text-xs`}>PDF or Image</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleCameraUpload}
                        disabled={uploading}
                        style={tw`flex-1 bg-white rounded-2xl p-4 items-center justify-center border border-slate-200 shadow-sm`}
                    >
                        <View style={tw`bg-slate-100 p-2 rounded-full mb-2`}>
                            <Ionicons name="camera" size={24} color="#475569" />
                        </View>
                        <Text style={tw`text-slate-900 font-bold`}>Take Photo</Text>
                        <Text style={tw`text-slate-500 text-xs`}>Scan directly</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Reports List */}
                <Text style={tw`text-lg font-bold text-slate-900 mb-4`}>Recent Reports</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={tw`mt-8`} />
                ) : reports.length === 0 ? (
                    <View style={tw`items-center justify-center py-12 opacity-50`}>
                        <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
                        <Text style={tw`text-slate-500 mt-2`}>No reports uploaded yet</Text>
                    </View>
                ) : (
                    reports.map((report) => (
                        <TouchableOpacity
                            key={report.id}
                            onPress={() => setSelectedReport(report)}
                            onLongPress={() => handleDelete(report)}
                            style={tw`bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm border border-slate-100`}
                        >
                            <View style={tw`w-12 h-12 rounded-xl items-center justify-center mr-4 ${report.type === 'pdf' ? 'bg-red-50' : 'bg-blue-50'
                                }`}>
                                <Ionicons
                                    name={report.type === 'pdf' ? 'document-text' : 'image'}
                                    size={24}
                                    color={report.type === 'pdf' ? '#EF4444' : '#3B82F6'}
                                />
                            </View>
                            <View style={tw`flex-1`}>
                                <Text style={tw`font-bold text-slate-900`} numberOfLines={1}>{report.name}</Text>
                                <View style={tw`flex-row items-center gap-2`}>
                                    <Text style={tw`text-slate-500 text-xs`}>
                                        {formatDate(report.createdAt)}
                                    </Text>
                                    {report.analysis && (
                                        <View style={tw`bg-green-100 px-1.5 py-0.5 rounded flex-row items-center`}>
                                            <MaterialCommunityIcons name="sparkles" size={10} color="#15803d" />
                                            <Text style={tw`text-green-700 text-[10px] font-bold ml-0.5`}>Analyzed</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Analysis Result Modal */}
            <Modal
                visible={!!selectedReport}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedReport(null)}
            >
                {selectedReport && selectedReport.analysis && (
                    <View style={tw`flex-1 bg-slate-50`}>
                        {/* Modal Header */}
                        <View style={tw`px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between`}>
                            <View style={tw`flex-row items-center gap-2`}>
                                <MaterialCommunityIcons name="sparkles" size={20} color="#7C3AED" />
                                <Text style={tw`text-lg font-bold text-slate-900`}>AI Analysis</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedReport(null)} style={tw`p-2 bg-slate-100 rounded-full`}>
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={tw`p-6 pb-12`}>
                            {/* Summary */}
                            <View style={tw`bg-blue-50 p-5 rounded-2xl mb-6`}>
                                <Text style={tw`font-bold text-blue-900 text-lg mb-2`}>Summary</Text>
                                <Markdown style={markdownStyles}>
                                    {selectedReport.analysis.summary}
                                </Markdown>
                            </View>

                            {/* Key Findings */}
                            <Text style={tw`font-bold text-slate-900 text-lg mb-4`}>Key Findings</Text>
                            <View style={tw`gap-3 mb-8`}>
                                {selectedReport.analysis.keyFindings.map((finding: any, idx: number) => (
                                    <View key={idx} style={tw`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row gap-4`}>
                                        <View style={tw`w-3 h-3 rounded-full mt-1.5 ${finding.status === 'CRITICAL' ? 'bg-red-500 shadow-sm shadow-red-500' :
                                            finding.status === 'ABNORMAL' ? 'bg-amber-500 shadow-sm shadow-amber-500' :
                                                'bg-green-500 shadow-sm shadow-green-500'
                                            }`} />
                                        <View style={tw`flex-1`}>
                                            <View style={tw`flex-row items-center justify-between mb-1`}>
                                                <Text style={tw`font-bold text-slate-900 text-base`}>{finding.parameter}</Text>
                                                <View style={tw`px-2 py-0.5 rounded border ${finding.status === 'CRITICAL' ? 'bg-red-50 border-red-100' :
                                                    finding.status === 'ABNORMAL' ? 'bg-amber-50 border-amber-100' :
                                                        'bg-green-50 border-green-100'
                                                    }`}>
                                                    <Text style={tw`text-xs font-bold ${finding.status === 'CRITICAL' ? 'text-red-700' :
                                                        finding.status === 'ABNORMAL' ? 'text-amber-700' :
                                                            'text-green-700'
                                                        }`}>{finding.value}</Text>
                                                </View>
                                            </View>
                                            <Text style={tw`text-slate-500 text-sm leading-5`}>{finding.interpretation}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Recommendations */}
                            <Text style={tw`font-bold text-slate-900 text-lg mb-4`}>Recommendations</Text>
                            <View style={tw`bg-purple-50 p-5 rounded-2xl border border-purple-100`}>
                                {selectedReport.analysis.recommendations.map((rec: string, idx: number) => (
                                    <View key={idx} style={tw`flex-row gap-3 mb-3 last:mb-0`}>
                                        <View style={tw`bg-white p-1 rounded-full w-5 h-5 items-center justify-center mt-0.5`}>
                                            <MaterialCommunityIcons name="star-four-points" size={10} color="#A855F7" />
                                        </View>
                                        <Text style={tw`text-slate-700 flex-1 leading-5`}>{rec}</Text>
                                    </View>
                                ))}
                            </View>

                            <Text style={tw`text-slate-400 text-xs text-center mt-8`}>
                                AI can make mistakes. Always consult a doctor.
                            </Text>
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </SafeAreaView>
    );
}

const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 15,
        lineHeight: 24,
        color: '#1e3a8a', // blue-900
    },
    strong: {
        fontWeight: 'bold',
        color: '#1e3a8a',
    },
});
