
'use server';

/**
 * @fileOverview A streaming Text-to-Speech (TTS) service.
 *
 * - textToSpeechStream - A function that takes text and returns a stream of audio chunks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

async function* textToSpeechStream(text: string): AsyncGenerator<Buffer> {
  if (!text.trim()) {
    return;
  }

  const { stream } = await ai.generateStream({
    model: 'googleai/gemini-2.5-flash-preview-tts',
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'zephyr' },
        },
      },
    },
    prompt: text,
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
