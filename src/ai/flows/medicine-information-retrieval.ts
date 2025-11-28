'use server';

/**
 * @fileOverview Retrieves medicine information from various medical websites and returns a conversational response with source links.
 *
 * - getMedicineInformation - A function that handles the retrieval of medicine information.
 * - MedicineInformationInput - The input type for the getMedicineInformation function.
 * - MedicineInformationOutput - The return type for the getMedicineInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const MedicineInformationInputSchema = z.object({
  medicineName: z.string().describe('The name of the medicine to search for.'),
  chatHistory: z.array(z.object({ 
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation history.'),
});
export type MedicineInformationInput = z.infer<typeof MedicineInformationInputSchema>;

const MedicineInformationOutputSchema = z.object({
  response: z.string().describe('A conversational response with information about the medicine and source links.'),
});
export type MedicineInformationOutput = z.infer<typeof MedicineInformationOutputSchema>;

export async function getMedicineInformation(input: MedicineInformationInput): Promise<MedicineInformationOutput> {
  return medicineInformationRetrievalFlow(input);
}

const medicineInformationRetrievalPrompt = ai.definePrompt({
  name: 'medicineInformationRetrievalPrompt',
  input: {schema: MedicineInformationInputSchema},
  output: {schema: MedicineInformationOutputSchema},
  prompt: `You are a helpful AI health assistant named MediAssistant AI. Your job is to provide information about medicines based on user input.

  When a user asks about a specific medicine, you must use the provided search tool to find information about it on the internet.
  
  Your response should be conversational and include details about the medicine's uses, dosage, and side effects.
  
  Most importantly, you must include clickable markdown links to the source websites where you found the information. This is critical for user trust and verification.
  
  Remember the context of the conversation to provide the most accurate information.

  Chat History:
  {{#each chatHistory}}
    {{#ifEquals role "user"}}User:{{else}}MediAssistant AI:{{/ifEquals}} {{{content}}}\n{{/each}}
  
  User query: {{{medicineName}}}
  `,
   tools: [googleAI.googleSearch()],
   helpers: {
    ifEquals: function(arg1, arg2, options) {
      // @ts-expect-error
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  },
});

const medicineInformationRetrievalFlow = ai.defineFlow(
  {
    name: 'medicineInformationRetrievalFlow',
    inputSchema: MedicineInformationInputSchema,
    outputSchema: MedicineInformationOutputSchema,
  },
  async input => {
    const {output} = await medicineInformationRetrievalPrompt(input);
    return output!;
  }
);
