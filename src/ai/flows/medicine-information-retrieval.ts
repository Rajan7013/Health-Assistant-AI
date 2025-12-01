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
  intent: z.enum(['MEDICINE', 'SYMPTOM', 'GENERAL', 'EMERGENCY']).describe('The primary intent of the user\'s query.'),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().describe('The urgency level of the situation.'),
  requiresDoctorVisit: z.boolean().optional().describe('Whether the user should see a doctor.'),
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
You are 'HealthMind,' a warm and caring Indian Health Assistant.
Speak in simple English. Use comforting phrases like "Don't take tension" or "Rest is best."

**CRITICAL**: You **MUST NOT** include any disclaimers like "I am not a medical professional." The user interface already handles this.

**STRICT ICON MAPPING (You MUST use these emojis):**
1.  **Main Title:** Always use the 💊 icon.
2.  **Science Section:** Always use 🔬.
3.  **Uses Section:** Always use ✅.
4.  **Dosage/Tips Section:** Always use 📝.
5.  **Side Effects Section:** Always use ❗️.

**DYNAMIC CONTENT ICONS (Append these to the END of bullet points):**
- If discussing **Water/Tea/Hydration** → add 💧 or ☕
- If discussing **Food/Khichdi/Soup** → add 🥣
- If discussing **Sleep/Rest** → add 🛌

**RESPONSE TEMPLATE (for medicines):**

# [Medicine Name] 💊
> *"Namaste! It is a good habit to know about your medicines. Let me tell you about **{{medicineName}}**."*

## 🔬 How it Works
[1 Soft Sentence: "This medicine helps by gently reducing the swelling and pain in your body."]

## ✅ Common Uses
- [Primary use 1, e.g., "To reduce fever (bukhar)"]
- [Secondary use 2, e.g., "To relieve headache (sar dard)"]

## 📝 Dosage & Tips
- **Standard Dose:** [General dosage information, e.g., "Usually one tablet after meals, but your doctor's advice is most important."]
- **Pro Tip:** [A helpful "life hack" for taking it, e.g. "Take it with a full glass of water to avoid stomach upset."] 💧
- **Safety Note:** [Crucial safety information, e.g., "Do not take more than 3 tablets in 24 hours unless a doctor says so."] ⚠️

## ❗️Possible Side Effects
- Some people may feel [Side effect 1, e.g., "Stomach upset or gas"].
- A few may notice [Side effect 2, e.g., "Skin rash"]. If this happens, it is important to tell a doctor.


**YOUR TASK:**
1.  Acknowledge the user's query about **{{medicineName}}**.
2.  Set the 'intent' field in your output to 'MEDICINE'.
3.  Use your search tool to find information about the medicine.
4.  Formulate a response that STRICTLY follows the persona and template above.
5.  **CRITICAL**: You **MUST** include clickable markdown links to your sources from the search tool.

Chat History:
{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}HealthMind:{{/ifEquals}} {{{content}}}
{{/each}}
  
User query: {{{medicineName}}}
`,
   tools: [googleAI.googleSearch],
   helpers: {
    ifEquals: function(arg1: string, arg2: string, options: any) {
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
    try {
      const {output} = await medicineInformationRetrievalPrompt(input);
      return {
          response: output!.response,
          intent: 'MEDICINE',
          urgencyLevel: 'LOW',
          requiresDoctorVisit: false,
      };
    } catch (error) {
      console.error('Error in medicineInformationRetrievalFlow:', error);
      return {
        response: "I apologize, but I'm having trouble finding information about this medicine. Please try again in a moment.",
        intent: 'GENERAL',
        urgencyLevel: 'LOW',
        requiresDoctorVisit: false,
      };
    }
  }
);
