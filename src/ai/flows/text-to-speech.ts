
'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) service that converts text into audible speech.
 *
 * - textToSpeech - A function that takes a string of text and returns a data URI for the audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const TextToSpeechInputSchema = z.string();
type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The base64 encoded data URI of the WAV audio file.'),
});
type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      const bufs: Buffer[] = [];
      writer.on('error', reject);
      writer.on('data', (d) => {
        bufs.push(d);
      });
      writer.on('end', () => {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: z.object({
      audioDataUri: z.string(),
    }),
  },
  async (text) => {
    if (!text.trim()) {
        return { audioDataUri: '' };
    }

    try {
        const { media } = await ai.generate({
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

        if (!media?.url) {
            console.warn('TTS model did not return audio data for the provided text.');
            return { audioDataUri: '' };
        }

        const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
        );
        
        const wavBase64 = await toWav(audioBuffer);

        return {
        audioDataUri: `data:audio/wav;base64,${wavBase64}`,
        };
    } catch (error) {
        console.error("Error in textToSpeechFlow:", error);
        return { audioDataUri: '' };
    }
  }
);
