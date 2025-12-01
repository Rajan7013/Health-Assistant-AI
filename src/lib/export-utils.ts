import { jsPDF } from "jspdf";
import { getAllChats, getAllMessages } from "@/firebase/firestore/chats";
import { getAllReports } from "@/firebase/firestore/reports";
import { getAllSchedules } from "@/firebase/firestore/schedules";
import { db } from "@/firebase";
import { User } from "firebase/auth";

export const exportUserData = async (user: User) => {
    try {
        const doc = new jsPDF();
        let yPos = 20;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;

        // Helper to check page break
        const checkPageBreak = (heightNeeded: number = 10) => {
            if (yPos + heightNeeded > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
            }
        };

        // --- Header ---
        doc.setFontSize(22);
        doc.setTextColor(10, 29, 66); // Dark Blue
        doc.text("HealthMind AI - Health Summary", 105, yPos, { align: "center" });
        yPos += 15;

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos, { align: "center" });
        doc.text(`User ID: ${user.uid}`, 105, yPos + 5, { align: "center" });
        doc.text(`Email: ${user.email}`, 105, yPos + 10, { align: "center" });
        yPos += 20;

        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;

        // --- 1. Medication Schedule ---
        checkPageBreak(30);
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235); // Blue
        doc.text("1. Medication Schedule", 20, yPos);
        yPos += 10;

        const schedules = await getAllSchedules(db, user.uid);
        if (schedules.length === 0) {
            doc.setFontSize(11);
            doc.setTextColor(60);
            doc.text("No active medication schedules found.", 25, yPos);
            yPos += 10;
        } else {
            doc.setFontSize(11);
            doc.setTextColor(0);
            schedules.forEach((schedule, index) => {
                checkPageBreak(15);
                doc.setFont("helvetica", "bold");
                doc.text(`• ${schedule.medicineName}`, 25, yPos);
                doc.setFont("helvetica", "normal");
                doc.text(`  ${schedule.time} (${schedule.frequency}) - Starts: ${schedule.startDate.toLocaleDateString()}`, 25, yPos + 5);
                yPos += 12;
            });
        }
        yPos += 5;

        // --- 2. Medical Reports ---
        checkPageBreak(30);
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text("2. Medical Reports", 20, yPos);
        yPos += 10;

        // Helper to render formatted text (Markdown-like)
        const renderFormattedText = (text: string, x: number, initialY: number, maxWidth: number, fontSize: number) => {
            let currentY = initialY;
            // Sanitize and split
            const cleanText = text.replace(/[^\x20-\x7E\n\r]/g, '');
            const lines = cleanText.split(/\r\n|\n|\r/);

            doc.setFontSize(fontSize);
            doc.setTextColor(0); // Default black

            lines.forEach(line => {
                let lineX = x;
                let isHeader = false;
                let isBullet = false;
                let textLine = line.trim();

                if (!textLine) {
                    currentY += lineHeight / 2;
                    return;
                }

                // Check for page break before starting a line
                checkPageBreak(10);

                // Headers
                if (textLine.startsWith('# ')) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(fontSize + 2);
                    doc.setTextColor(10, 29, 66); // Dark Blue for headers
                    textLine = textLine.substring(2);
                    isHeader = true;
                } else if (textLine.startsWith('## ')) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(fontSize + 1);
                    doc.setTextColor(30); // Dark Gray
                    textLine = textLine.substring(3);
                    isHeader = true;
                }
                // Bullets
                else if (textLine.startsWith('- ') || textLine.startsWith('* ')) {
                    lineX += 5;
                    doc.setFont("helvetica", "bold");
                    doc.text("•", x, currentY);
                    doc.setFont("helvetica", "normal");
                    textLine = textLine.substring(2);
                    isBullet = true;
                }
                // Blockquotes (Fix for > character)
                else if (textLine.startsWith('> ') || textLine.startsWith('>')) {
                    lineX += 5;
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(80); // Lighter gray for quotes
                    textLine = textLine.replace(/^>\s?/, '');
                }

                // Process Bold segments: **text**
                const parts = textLine.split(/(\*\*.*?\*\*)/g);

                parts.forEach(part => {
                    if (!part) return;

                    let isBold = false;
                    let textSegment = part;

                    if (part.startsWith('**') && part.endsWith('**')) {
                        isBold = true;
                        textSegment = part.substring(2, part.length - 2);
                        doc.setFont("helvetica", "bold");
                    } else {
                        if (!isHeader) doc.setFont("helvetica", "normal");
                    }

                    const words = textSegment.split(' ');
                    words.forEach((word, i) => {
                        const wordWithSpace = i < words.length - 1 ? word + " " : word;
                        const wordWidth = doc.getTextWidth(wordWithSpace);

                        if (lineX + wordWidth > x + maxWidth) {
                            currentY += lineHeight;
                            checkPageBreak(10);
                            lineX = isBullet ? x + 5 : x;
                        }

                        doc.text(wordWithSpace, lineX, currentY);
                        lineX += wordWidth;
                    });
                });

                // Reset for next line
                currentY += lineHeight;
                if (isHeader) {
                    currentY += 2;
                    doc.setFontSize(fontSize);
                    doc.setTextColor(0);
                    doc.setFont("helvetica", "normal");
                }
            });

            return currentY;
        };

        const reports = await getAllReports(db, user.uid);
        if (reports.length === 0) {
            doc.setFontSize(11);
            doc.setTextColor(60);
            doc.text("No medical reports uploaded.", 25, yPos);
            yPos += 10;
        } else {
            doc.setFontSize(11);
            doc.setTextColor(0);
            reports.forEach((report) => {
                checkPageBreak(25);
                doc.setFont("helvetica", "bold");
                doc.text(`• ${report.name} (${report.type.toUpperCase()})`, 25, yPos);
                doc.setFont("helvetica", "normal");
                doc.text(`  Date: ${report.createdAt?.toDate().toLocaleDateString() || 'N/A'}`, 25, yPos + 5);

                if (report.analysis && report.analysis.summary) {
                    // Use new renderer for report summaries too
                    yPos += 10;
                    yPos = renderFormattedText(report.analysis.summary, 25, yPos, 160, 10);
                    yPos += 5;
                } else {
                    yPos += 12;
                }
            });
        }
        yPos += 5;

        // --- 3. Chat History (Recent) ---
        checkPageBreak(30);
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text("3. Recent Chat Sessions", 20, yPos);
        yPos += 10;

        const chats = await getAllChats(user.uid);
        if (chats.length === 0) {
            doc.setFontSize(11);
            doc.setTextColor(60);
            doc.text("No chat history found.", 25, yPos);
            yPos += 10;
        } else {
            // Limit to last 5 chats
            const recentChats = chats.slice(0, 5);

            for (const chat of recentChats) {
                checkPageBreak(20);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0);
                doc.setFontSize(12);
                doc.text(`Session: ${chat.title}`, 25, yPos);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`${new Date(chat.createdAt).toLocaleDateString()}`, 170, yPos, { align: "right" });
                yPos += 8;

                const messages = await getAllMessages(user.uid, chat.id);
                const recentMessages = messages.slice(-5);

                recentMessages.forEach(msg => {
                    checkPageBreak(15);
                    const prefix = msg.role === 'user' ? 'You: ' : 'AI: ';

                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(10);
                    doc.setTextColor(msg.role === 'user' ? 0 : 37, 99, 235); // Black for User, Blue for AI
                    doc.text(prefix, 25, yPos);

                    // Render message content with markdown support
                    // Offset X by prefix width approx 10-15 units
                    yPos = renderFormattedText(msg.content, 35, yPos, 150, 10);
                    yPos += 5;
                });
                yPos += 5;
            }
        }

        // Save
        doc.save(`HealthMind_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;

    } catch (error) {
        console.error("Export failed:", error);
        throw error;
    }
};
