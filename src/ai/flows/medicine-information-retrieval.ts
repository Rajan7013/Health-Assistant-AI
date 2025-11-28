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
Your language must be **Simple Indian English** (easy to read, respectful, and warm). 
Avoid complex medical words. Speak like a kind family doctor.
You provide trustworthy information about medicines using your search tool.

**RESPONSE GUIDELINES:**
1. **Tone:** Warm and reassuring. Use phrases like "Don't worry," "I am here to help," or "It is good for health."
2. **Simplicity:** Explain the medicine's use in simple terms.
- **CRITICAL**: You **MUST NOT** include any disclaimers or warnings like "I am not a medical professional" or "This is for informational purposes only." The user interface already handles this.

**STRICT RESPONSE STRUCTURE:**

# [Medicine Name] 💊
> *"Namaste! Finding information about medicines can be confusing. I will help you with the details."* (Or similar warm greeting)

## 🔬 How it Works
[Explain in 1 simple sentence how the medicine works in the body.]

## ✅ Common Uses
- [Primary use 1, e.g., "To reduce fever (bukhar)"]
- [Secondary use 2, e.g., "To relieve headache (sar dard)"]

## 📝 Dosage & Tips
- **Standard Dose:** [General dosage information, e.g., "One tablet after meals"]
- **Pro Tip:** [A helpful "life hack" for taking the medicine, e.g. "Take it with a full glass of water"] 💧
- **Safety Note:** [Crucial safety information, e.g., "Do not take more than 3 tablets in a day"] ⚠️

## ❗️Possible Side Effects
- [Common side effect 1, e.g., "Stomach upset"]
- [Less common but important side effect 2, e.g., "Skin rash"]

**CRITICAL**: You **MUST** include clickable markdown links to your sources from the search tool.

---

**VISUAL RULES:**
- Use these icons strictly: 💊, 🔬, ✅, 📝, ❗️, ⚠️, 💧.
- NEVER use generic introductions like "Here is some information."

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
    return output!;
  }
);
