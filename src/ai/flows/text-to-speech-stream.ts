'use server';

/**
 * @fileOverview A streaming Text-to-Speech (TTS) service with improved error handling and chunking.
 *
 * Features:
 * - Streaming audio generation for real-time playback
 * - Markdown stripping for better voice output
 * - Text chunking for long content
 * - Error handling and fallback mechanisms
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Helper function to strip markdown formatting for better TTS
function stripMarkdownForTTS(text: string): string {
  return text
    // Remove headers
    .replace(/#{1,6}\s+/g, '')
    // Remove bold/italic
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '')
    // Remove emojis (optional)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Split long text into manageable chunks (max ~500 chars per chunk)
function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const cleanText = stripMarkdownForTTS(text);
  
  if (cleanText.length <= maxChunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Generate streaming audio from text using Gemini TTS
 * @param text - The text to convert to speech
 * @yields Audio chunks as Buffers
 */
async function* textToSpeechStream(text: string): AsyncGenerator<Buffer> {
  const cleanText = stripMarkdownForTTS(text);
  
  if (!cleanText.trim()) {
    console.warn('Empty text provided to TTS');
    return;
  }

  try {
    // For very long text, process in chunks
    const chunks = chunkText(cleanText, 500);
    
    for (const chunk of chunks) {
      try {
        const { stream } = await ai.generateStream({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Puck' },
              },
            },
          },
          prompt: chunk,
        });

        for await (const streamChunk of stream) {
          const audioContent = streamChunk.media?.url;
          if (audioContent) {
            const b64 = audioContent.substring(audioContent.indexOf(',') + 1);
            const buffer = Buffer.from(b64, 'base64');
            
            if (buffer.length > 0) {
              yield buffer;
            }
          }
        }
      } catch (chunkError) {
        console.error(`Error processing TTS chunk:`, chunkError);
        // Continue with next chunk instead of failing completely
      }
    }
  } catch (error) {
    console.error('Fatal error in textToSpeechStream:', error);
    throw new Error('Failed to generate speech audio');
  }
}

const textToSpeechStreamFlow = ai.defineFlow(
  {
    name: 'textToSpeechStreamFlow',
    inputSchema: z.string(),
    outputSchema: z.any(),
    stream: true,
  },
  textToSpeechStream
);

export { textToSpeechStreamFlow as textToSpeechStream };
export { stripMarkdownForTTS, chunkText };
