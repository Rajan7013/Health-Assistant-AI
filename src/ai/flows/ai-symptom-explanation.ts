'use server';
/**
 * @fileOverview An AI agent to provide explanations for health symptoms.
 *
 * - explainSymptoms - A function that accepts symptoms and returns potential explanations.
 * - SymptomExplanationInput - The input type for the explainSymptoms function.
 * - SymptomExplanationOutput - The return type for the explainSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomExplanationInputSchema = z.object({
  symptoms: z
    .string()
    .describe("The user's health symptoms, described in a few sentences."),
});
export type SymptomExplanationInput = z.infer<typeof SymptomExplanationInputSchema>;

const SymptomExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A detailed explanation of the possible causes, control measures, types, examples, and advice on when to contact doctors.'),
});
export type SymptomExplanationOutput = z.infer<typeof SymptomExplanationOutputSchema>;

export async function explainSymptoms(input: SymptomExplanationInput): Promise<SymptomExplanationOutput> {
  return explainSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomExplanationPrompt',
  input: {schema: SymptomExplanationInputSchema},
  output: {schema: SymptomExplanationOutputSchema},
  prompt: `You are a helpful AI assistant that provides explanations for health symptoms.

You will use the provided symptoms to generate a detailed explanation including possible causes, control measures, types, examples, and advice on when to contact doctors. Explain in simple terms.

Symptoms: {{{symptoms}}}`,
});

const explainSymptomsFlow = ai.defineFlow(
  {
    name: 'explainSymptomsFlow',
    inputSchema: SymptomExplanationInputSchema,
    outputSchema: SymptomExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
