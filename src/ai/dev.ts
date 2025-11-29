'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-symptom-explanation.ts';
import '@/ai/flows/context-aware-chatbot.ts';
import '@/ai/flows/medicine-information-retrieval.ts';
import '@/ai/flows/text-to-speech.ts';
