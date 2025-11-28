'use server';

/**
 * @fileOverview An AI-powered chat interface that remembers conversation context and intent.
 *
 * - contextAwareChatbot - A function that handles the chat process.
 * - ContextAwareChatbotInput - The input type for the contextAwareChatbot function.
 * - ContextAwareChatbotOutput - The return type for the contextAwareChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getMedicineInformation } from './medicine-information-retrieval';

const ContextAwareChatbotInputSchema = z.object({
  message: z.string().describe('The user message.'),
  chatHistory: z.array(z.object({ 
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The chat history.'),
});

export type ContextAwareChatbotInput = z.infer<typeof ContextAwareChatbotInputSchema>;

const ContextAwareChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response.'),
});

export type ContextAwareChatbotOutput = z.infer<typeof ContextAwareChatbotOutputSchema>;

const shouldRouteToMedicineSearch = ai.definePrompt({
    name: 'shouldRouteToMedicineSearchPrompt',
    input: { schema: z.object({ message: z.string(), chatHistory: z.any().optional() }) },
    output: { schema: z.object({ shouldRoute: z.boolean(), medicineName: z.string().optional() }) },
    prompt: `You are an expert at routing user queries. Determine if the following user message is asking for information about a specific medicine.

    If the user is asking about a medicine, set shouldRoute to true and extract the medicine name.
    
    Chat History:
    {{#each chatHistory}}
        User: {{{this.content}}}
    {{/each}}

    User message: {{{message}}}
    `,
});


export async function contextAwareChatbot(input: ContextAwareChatbotInput): Promise<ContextAwareChatbotOutput> {
    const { output } = await shouldRouteToMedicineSearch(input);
    
    if (output?.shouldRoute && output.medicineName) {
        return getMedicineInformation({
            medicineName: output.medicineName,
            chatHistory: input.chatHistory,
        });
    }

  return contextAwareChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextAwareChatbotPrompt',
  input: {
    schema: ContextAwareChatbotInputSchema,
  },
  output: {
    schema: ContextAwareChatbotOutputSchema,
  },
  prompt: `You are HealthMind AI, a friendly and empathetic AI health assistant. Your goal is to provide clear, helpful, and trustworthy information about health, diseases, and medicines.

- Your tone MUST be warm, empathetic, and caring. Avoid robotic or overly clinical language.
- **CRITICAL**: You **MUST NOT** provide any medical advice, diagnoses, or prescriptions.
- **CRITICAL**: You **MUST NOT** include any disclaimers or warnings like "I am not a medical professional" or "This is for informational purposes only." The user interface already handles this, and repeating it will create a bad user experience.

**CRITICAL FORMATTING RULES**:
You MUST strictly follow this formatting for every response:
- Use '# ' (H1) for the Main Condition Name ONLY (e.g., # Fever).
- Use '## ' (H2) for Sections (e.g., ## Symptoms, ## Treatment).
- Use '**' for Key Medical Terms and Medicines (e.g., **Paracetamol**, **Hydration**).
- Use '- ' for bullet points.
- Use '> ' for important notes.
- Insert a double line break ('\n\n') between paragraphs for clear spacing.
- Use specific emojis as icons where relevant: 💊 (Medicines), 🌡️ (Symptoms), ⚠️ (Warnings/Side Effects), 💧 (Hydration/Water).

Chat History:
{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}HealthMind AI:{{/ifEquals}} {{{content}}}
{{/each}}

User: {{{message}}}
HealthMind AI:`,
  
  helpers: {
    ifEquals: function(arg1, arg2, options) {
      // @ts-expect-error
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  },
});

const contextAwareChatbotFlow = ai.defineFlow(
  {
    name: 'contextAwareChatbotFlow',
    inputSchema: ContextAwareChatbotInputSchema,
    outputSchema: ContextAwareChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      response: output!.response,
    };
  }
);
