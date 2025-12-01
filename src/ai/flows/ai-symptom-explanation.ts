'use server';
/**
 * @fileOverview A Medical Diagnostic API that analyzes symptoms and returns structured JSON data.
 *
 * - explainSymptoms - A function that accepts symptoms and returns a structured JSON report.
 * - SymptomExplanationInput - The input type for the explainSymptoms function.
 * - SymptomExplanationOutput - The return type for the explainSymptoms function (JSON report).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SymptomExplanationInputSchema = z.object({
  symptoms: z
    .string()
    .describe("The user's health symptoms, described in a few sentences."),
});
export type SymptomExplanationInput = z.infer<typeof SymptomExplanationInputSchema>;

const SymptomExplanationOutputSchema = z.object({
  primary_condition: z.string().describe("Name of the most likely issue"),
  confidence_score: z.number().describe("A number between 0-100 representing the AI's confidence."),
  severity_level: z.enum(["Mild", "Moderate", "Severe", "Critical"]).describe("The estimated severity of the condition."),
  urgency_color: z.string().describe("A hex color code representing urgency. Green for Mild, Orange for Moderate, Red for Severe/Critical."),
  root_causes: z.array(z.string()).describe("A list of likely root causes for the symptoms."),
  action_plan: z.object({
    immediate: z.string().describe("An immediate action the user can take for relief."),
    long_term: z.string().describe("A long-term action or preventative measure."),
  }).describe("A plan with immediate and long-term actions."),
  triage_advice: z.string().describe("A clear recommendation, e.g., 'Home Care is sufficient' or 'Visit a Doctor'.")
});
export type SymptomExplanationOutput = z.infer<typeof SymptomExplanationOutputSchema>;

export async function explainSymptoms(input: SymptomExplanationInput): Promise<SymptomExplanationOutput> {
  return explainSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomExplanationAsApiPrompt',
  input: { schema: SymptomExplanationInputSchema },
  output: { schema: SymptomExplanationOutputSchema },
  prompt: `**ROLE:** You are a Medical Diagnostic API.
**GOAL:** Analyze symptoms and return raw JSON data only. DO NOT speak to the user.

**INPUT:** User Symptoms: "{{symptoms}}"

**OUTPUT FORMAT:**
Return a valid JSON object strictly following this structure:
{
  "primary_condition": "Name of the most likely issue",
  "confidence_score": 85, // Number between 0-100
  "severity_level": "Moderate", // "Mild", "Moderate", "Severe", or "Critical"
  "urgency_color": "#FFA500", // Green for Mild, Orange for Moderate, Red for Severe
  "root_causes": ["Screen Glare", "Dry Eyes", "Lack of Blinking"],
  "action_plan": {
     "immediate": "Apply cool compress",
     "long_term": "Follow 20-20-20 rule"
  },
  "triage_advice": "Home Care is sufficient" // or "Visit Doctor"
}`,
});

const explainSymptomsFlow = ai.defineFlow(
  {
    name: 'explainSymptomsFlow',
    inputSchema: SymptomExplanationInputSchema,
    outputSchema: SymptomExplanationOutputSchema,
  },
  async input => {
    let lastError;
    for (let i = 0; i < 3; i++) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (error: any) {
        console.warn(`Attempt ${i + 1} failed:`, error.message);
        lastError = error;
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw lastError;
  }
);
