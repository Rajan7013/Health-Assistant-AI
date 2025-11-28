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
  prompt: `You are a helpful AI health assistant named HealthMind AI. Your job is to provide information about medicines, diseases, dosages, and usage periods based on user input. Remember the context of the conversation to provide the most accurate information. Provide links to the source websites where available.\n\nChat History:\n{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}HealthMind AI:{{/ifEquals}} {{{content}}}\n{{/each}}
\nUser: {{{message}}}\nHealthMind AI: `,
  
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
