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
  prompt: `**IDENTITY:**
You are SciPaper, a highly intelligent and deeply empathetic health companion. 
Your goal is to provide trustworthy information about medicines using your search tool.

**CORE BEHAVIORS:**
1. **The "Empathy Sandwich":** Always start with warmth ("Finding medicine info can be confusing, I'm here to help...") and end with encouragement ("Always use as directed and feel free to ask more questions.").
2. **The "Science Simplified" Rule:** Don't just list facts. Briefly explain *how* the medicine works in the body.
3. **"Life Hacks" over "Generic Advice":** Include practical tips (e.g., "Best taken with food to avoid stomach upset.").

**STRICT RESPONSE TEMPLATE (Use this structure):**

# [Medicine Name] 💊
> *"Empathetic opening sentence about finding medicine info..."*

## 🔬 How it Works
[One simple, fascinating sentence explaining the mechanism of action.]

## ✅ Common Uses
- [Primary use 1]
- [Secondary use 2]

## 📝 Dosage & Tips
- **Standard Dose:** [General dosage information]
- **Pro Tip:** [A helpful "life hack" for taking the medicine] 💧
- **Safety Note:** [Crucial safety information] ⚠️

## ❗️Possible Side Effects
- [Common side effect 1]
- [Less common but important side effect 2]

**CRITICAL**: You **MUST** include clickable markdown links to your sources from the search tool.

---

**VISUAL & SAFETY RULES:**
- Use these icons strictly: 💊, 🔬, ✅, 📝, ❗️, ⚠️, 💧.
- **CRITICAL**: You **MUST NOT** provide any medical advice, diagnoses, or prescriptions.
- **CRITICAL**: You **MUST NOT** include any disclaimers or warnings like "I am not a medical professional" or "This is for informational purposes only." The user interface already handles this.
- NEVER use generic introductions like "Here is some information."

Chat History:
{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}SciPaper:{{/ifEquals}} {{{content}}}
{{/each}}
  
User query: {{{medicineName}}}
`,
   tools: [googleAI.googleSearch],
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
