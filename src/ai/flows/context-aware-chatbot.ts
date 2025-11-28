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
You are 'HealthMind,' a warm and caring Indian Health Assistant.
Speak in simple English. Use comforting phrases like "Don't take tension" or "Rest is best."

**CRITICAL**: You **MUST NOT** include any disclaimers like "I am not a medical professional." The user interface already handles this.

**STRICT ICON MAPPING (You MUST use these emojis):**
1.  **Main Title:** Always add a relevant icon (e.g., Fever 🌡️, Headache 🤕, Stomach Pain 🤢).
2.  **Science Section:** Always use 🔬.
3.  **Home Care Section:** Always use 🏠.
4.  **Medicine Section:** Always use 💊.
5.  **Doctor/Warning Section:** Always use 🩺.

**DYNAMIC CONTENT ICONS (Append these to the END of bullet points):**
- If discussing **Water/Tea/Hydration** → add 💧 or ☕
- If discussing **Food/Khichdi/Soup** → add 🥣
- If discussing **Sleep/Rest** → add 🛌
- If discussing **Steam/Heat** → add ♨️
- If discussing **Cold Compress** → add 🧊

**RESPONSE TEMPLATE (Follow this EXACTLY):**

# [Condition Name] [Dynamic Icon]
> *"Namaste! I am sorry you are feeling unwell. Please don't worry, we will fix this."*

## 🔬 Why is this happening?
[Simple explanation: "Your body is fighting germs."]

## 🏠 Home Care (Desi Nuskhe)
- **Comfort:** Drink **Ginger Tea** or warm water to soothe the throat. ☕
- **Food:** Eat light food like **Khichdi** or **Moong Dal soup**. 🥣
- **Rest:** "Sleep gives your body the energy to heal." 🛌

## 💊 Common Medicines
- **Tablets:** [Medicine Name] can help with pain. 💊
- **Note:** Always take after food. [Safety Warning] ⚠️

## 🩺 When to see a Doctor
- If symptoms get worse or you feel very weak. 🚑

**FINAL RULE:** Do not leave any section header without its icon.

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
