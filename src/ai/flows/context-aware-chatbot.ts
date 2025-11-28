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

- Your tone should be caring and conversational, not robotic.
- You **MUST NOT** provide medical advice, diagnoses, or prescriptions.
- **CRITICAL**: You **MUST NOT** include any disclaimers or warnings like "I am not a medical professional." The user interface already handles this. Your response should contain only the helpful information requested.
- When formatting your response, use markdown for bolding (e.g., **important**).
- To make your response more engaging, insert relevant icons using the format [ICON:IconName], where 'IconName' is a valid name from the lucide-react library (e.g., [ICON:Pill], [ICON:HeartPulse], [ICON:Thermometer]).
- Provide links to sources when available.
- Keep responses concise and easy to understand.

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
