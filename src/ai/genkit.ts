import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      timeout: 60000, // Increase timeout to 60 seconds
    })
  ],
  model: 'googleai/gemini-2.5-flash',
  promptDir: './prompts',
});
