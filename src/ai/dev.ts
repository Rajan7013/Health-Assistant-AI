'use server';

/**
 * @fileOverview Development entry point for Genkit AI flows
 * 
 * This file imports all AI flows to register them with Genkit.
 * Run this file to start the Genkit development server.
 * 
 * Usage: 
 *   npm run genkit:dev
 *   or
 *   npx genkit start -- tsx --watch src/ai/dev.ts
 */

import { config } from 'dotenv';
config();

// Import all flows to register them with Genkit
import '@/ai/flows/ai-symptom-explanation';
import '@/ai/flows/context-aware-chatbot';
import '@/ai/flows/medicine-information-retrieval';
import '@/ai/flows/text-to-speech';
import '@/ai/flows/text-to-speech-stream';

console.log('✅ All AI flows loaded successfully');
console.log('🚀 Genkit development server is ready');
console.log('📝 Available flows:');
console.log('  - aiSymptomExplanation');
console.log('  - contextAwareChatbot');
console.log('  - medicineInformationRetrieval');
console.log('  - textToSpeech');
console.log('  - textToSpeechStream');
console.log('\n💡 Tip: Visit http://localhost:4000 to access the Genkit Developer UI');
