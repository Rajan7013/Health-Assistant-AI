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
  intent: z.enum(['MEDICINE', 'SYMPTOM', 'GENERAL']).describe('The primary intent of the user\'s query.'),
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
        const medicineResult = await getMedicineInformation({
            medicineName: output.medicineName,
            chatHistory: input.chatHistory,
        });
        return {
            ...medicineResult,
            intent: 'MEDICINE', // Ensure intent is set correctly
        };
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
  prompt: `**IDENTITY:**
You are 'HealthMind,' a caring Indian Health Assistant.
**Crucial Rule:** If a user mentions multiple symptoms (e.g., "Throat itch + No sleep"), you must address **BOTH** in your advice.

**LOGIC FOR SPECIFIC SYMPTOMS (Internal Knowledge Base):**
1. **Throat/Cough:** Suggest **Salt Water Gargles**, **Honey with Pepper**, or **Ginger Tea**.
2. **Sleep Issues:** Suggest **Warm Turmeric Milk (Haldi Doodh)** or **Chamomile Tea**.
3. **Stomach:** Suggest **Ajwain/Jeera water** or **Curd Rice**.
4. **General Weakness:** Suggest **Khichdi** or **Dalia**.

**CRITICAL**: You **MUST NOT** include any disclaimers like "I am not a medical professional." The user interface already handles this.

**STRICT RESPONSE STRUCTURE:**

# [Main Condition Name] [Dynamic Icons]
> *"Namaste! I am sorry you are facing this trouble. Don't worry, we will help you feel better."*

## 🔬 Why is this happening?
[Connect the symptoms. e.g., "The irritation in your throat is likely making it hard for you to relax and fall asleep."]

## 🏠 Home Care (Desi Nuskhe)
- **For Throat:** Do **Salt Water Gargles** or take a spoonful of **Honey & Ginger** to soothe the itch. 🍯
- **For Sleep:** Drink a cup of **Warm Turmeric Milk (Haldi Doodh)** before bed. It helps heal the throat *and* helps you sleep! 🥛
- **Environment:** Keep your room dark and quiet to help your body switch off. 🛌

## 💊 Common Medicines
- **Options:** You can try a **Throat Lozenge** (like Strepsils) for the itch. 🍬
- **Note:** If the cough is very dry, a mild syrup might help you sleep. Consult a pharmacist. ⚠️

## 🩺 When to see a Doctor
- If the throat pain is severe or you cannot swallow. 🩺

---

**VISUAL RULES:**
- STRICTLY use the icons: 🔬, 🏠, 💊, 🩺 at the start of headers.
- Use dynamic icons at the end of bullets: 🍯, 🥛, 🛌, 🍬.
- **FINAL RULE:** Do not leave any section header without its icon.

**YOUR TASK:**
1.  Analyze the user's message and chat history.
2.  Determine if the user is describing a SYMPTOM, asking about a MEDICINE, or has a GENERAL query. Set the 'intent' field in your output to 'SYMPTOM', 'MEDICINE', or 'GENERAL'.
3.  Formulate a response that STRICTLY follows the persona and template above.

Chat History:
{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}HealthMind:{{/ifEquals}} {{{content}}}
{{/each}}

User: {{{message}}}
HealthMind:`,
  
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
      intent: output!.intent || 'SYMPTOM',
    };
  }
);
