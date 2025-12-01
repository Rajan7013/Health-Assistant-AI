import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the output schema for the analysis
const AnalysisOutputSchema = z.object({
    summary: z.string().describe('A detailed, markdown-formatted summary of the medical report. Use bold text for emphasis and bullet points where appropriate.'),
    keyFindings: z.array(z.object({
        parameter: z.string().describe('The name of the test or parameter (e.g., Hemoglobin).'),
        value: z.string().describe('The value found in the report.'),
        status: z.enum(['NORMAL', 'ABNORMAL', 'CRITICAL']).describe('The status of the finding.'),
        interpretation: z.string().describe('A brief explanation of what this means.'),
    })).describe('Key findings extracted from the report.'),
    recommendations: z.array(z.string()).describe('General health recommendations based on the report.'),
});

export async function POST(request: NextRequest) {
    try {
        const { fileData, mimeType } = await request.json();

        if (!fileData || !mimeType) {
            return NextResponse.json(
                { error: 'File data and mime type are required' },
                { status: 400 }
            );
        }

        // Clean the base64 string if it contains the data URL prefix
        const base64Clean = fileData.replace(/^data:.*,/, '');

        // Call Gemini with the file data
        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: [
                {
                    text: `You are an expert medical AI assistant. Analyze this medical report (PDF or Image).
                
                **Instructions:**
                1.  **Summarize**: Provide a clear, comforting summary. Use **markdown** (bolding, lists) to make it readable.
                2.  **Extract Key Findings**: Identify important results.
                3.  **Explain**: Briefly explain any abnormal results.
                4.  **Recommend**: Give 3-5 practical lifestyle tips.
                5.  **Disclaimer**: Start with "This analysis is for informational purposes only..."` },
                { media: { url: `data:${mimeType};base64,${base64Clean}` } }
            ],
            output: { schema: AnalysisOutputSchema },
        });

        return NextResponse.json(output);

    } catch (error) {
        console.error('Error analyzing report:', error);
        return NextResponse.json(
            { error: 'Failed to analyze report' },
            { status: 500 }
        );
    }
}
