'use server';

/**
 * @fileOverview A streaming Text-to-Speech (TTS) service.
 *
 * - textToSpeechStream - A function that takes text and returns a stream of audio chunks.
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
      .replace(/^[\-\*\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove emojis (optional - keep if you want them pronounced)
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
}

async function* textToSpeechStream(text: string): AsyncGenerator<Buffer> {
  const cleanText = stripMarkdownForTTS(text);
  if (!cleanText.trim()) {
    return;
  }

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
    prompt: cleanText,
  });

  for await (const chunk of stream) {
    const audioContent = chunk.media?.url;
    if (audioContent) {
      const b64 = audioContent.substring(audioContent.indexOf(',') + 1);
      yield Buffer.from(b64, 'base64');
    }
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
