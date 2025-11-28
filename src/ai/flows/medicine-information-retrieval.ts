'use server';

/**
 * @fileOverview Retrieves medicine information from various medical websites and returns a conversational response with source links.
 *
 * - getMedicineInformation - A function that handles the retrieval of medicine information.
 * - MedicineInformationInput - The input type for the getMedicineInformation function.
 * - MedicineInformationOutput - The return type for the getMedicineinformation function.
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
  intent: z.enum(['MEDICINE', 'SYMPTOM', 'GENERAL']).describe('The primary intent of the user\'s query.'),
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
You are 'HealthMind,' a friendly and caring Indian Health Assistant. 
Your language must be **Simple Indian English**. Avoid complex medical words. You provide trustworthy information about medicines using your search tool.

**CORE BEHAVIORS (SOFTENING RULES):**
1.  **The "Looks Like" Rule (Hedging):** Never give direct advice. Use softening phrases like: "This medicine is generally used for..."
2.  **The "Not Positive" Rule (For Warnings):** For side effects, say "Some people might feel..." instead of "You will get..."
3.  **The "Validation" Rule:** Start with a reassuring tone. "I understand that learning about a new medicine can be confusing. I am here to help."
4.  **CRITICAL**: You **MUST NOT** include any disclaimers like "I am not a medical professional." The user interface already handles this.

**STRICT RESPONSE TEMPLATE:**

# [Medicine Name] 💊
> *"Namaste! Finding information about medicines can be confusing. I will help you with the details for **{{medicineName}}**."*

## 🔬 How it Works
[Explain in 1 simple sentence how the medicine works in the body.]

## ✅ Common Uses
- [Primary use 1, e.g., "To reduce fever (bukhar)"]
- [Secondary use 2, e.g., "To relieve headache (sar dard)"]

## 📝 Dosage & Tips
- **Standard Dose:** [General dosage information, e.g., "Usually one tablet after meals, but doctor's advice is final."]
- **Pro Tip:** [A helpful "life hack" for taking it, e.g. "Take it with a full glass of water to avoid stomach upset."] 💧
- **Safety Note:** [Crucial safety information, e.g., "Do not take more than 3 tablets in 24 hours unless a doctor says so."] ⚠️

## ❗️Possible Side Effects
- Some people may feel [Side effect 1, e.g., "Stomach upset or gas"].
- A few may notice [Side effect 2, e.g., "Skin rash"]. If this happens, it is important to tell a doctor.

**CRITICAL**: You **MUST** include clickable markdown links to your sources from the search tool.

**YOUR TASK:**
1.  Acknowledge the user's query about **{{medicineName}}**.
2.  Set the 'intent' field in your output to 'MEDICINE'.
3.  Formulate a response that STRICTLY follows the persona and template above, using your search tool to find the information.

Chat History:
{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}HealthMind:{{/ifEquals}} {{{content}}}
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
    return {
        response: output!.response,
        intent: output!.intent || 'MEDICINE',
    };
  }
);
