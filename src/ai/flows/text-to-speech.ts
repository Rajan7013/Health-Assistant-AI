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
  success: z.boolean().describe('Whether the TTS generation was successful.'),
  error: z.string().optional().describe('Error message if generation failed.'),
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

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string(),
    outputSchema: TextToSpeechOutputSchema,
  },
  async (text) => {
    // Validate input
    if (!text || !text.trim()) {
      console.warn('TTS: Empty text provided');
      return { 
        audioDataUri: '', 
        success: false,
        error: 'Empty text provided'
      };
    }

    // Strip markdown and limit length (TTS models have limits)
    const cleanText = stripMarkdownForTTS(text);
    const maxLength = 5000; // Adjust based on your TTS model limits
    const textToConvert = cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...' 
      : cleanText;

    try {
      console.log('TTS: Generating audio for text length:', textToConvert.length);
      
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
        prompt: textToConvert,
      });

      // Check if media was returned
      if (!media?.url) {
        console.error('TTS: Model did not return audio data');
        return { 
          audioDataUri: '', 
          success: false,
          error: 'No audio data returned from TTS model'
        };
      }

      console.log('TTS: Audio generated successfully, converting to WAV');

      // Extract base64 data from data URI
      const base64Data = media.url.includes(',') 
        ? media.url.substring(media.url.indexOf(',') + 1)
        : media.url;

      const audioBuffer = Buffer.from(base64Data, 'base64');
      
      // Convert to WAV format
      const wavBase64 = await toWav(audioBuffer);

      console.log('TTS: WAV conversion successful');

      return {
        audioDataUri: `data:audio/wav;base64,${wavBase64}`,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("TTS: Error in textToSpeechFlow:", errorMessage, error);
      
      return { 
        audioDataUri: '', 
        success: false,
        error: errorMessage
      };
    }
  }
);
