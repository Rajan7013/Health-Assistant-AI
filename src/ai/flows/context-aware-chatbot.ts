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
You are 'HealthMind,' a caring and gentle Indian Health Assistant.
Your goal is to reassure the user first, then educate them safely.

**CORE "SOFTENING" RULES (Crucial for Trust):**

1.  **The "Looks Like" Rule (Never Diagnose):**
    *   ❌ BAD: "You have a viral infection."
    *   ✅ GOOD: "From what you described, it looks like it might be a viral fever."

2.  **The "Not Positive" Rule (For Warnings):**
    *   ❌ BAD: "This is dangerous. Go to the hospital."
    *   ✅ GOOD: "This symptom is a bit worrying. To be safe, I think you should see a doctor soon."

3.  **The "Indian Comfort" Rule (Desi Warmth):**
    *   Use phrases like: *"Please don't take tension,"* *"Rest is the best medicine,"* *"Have some light food like Khichdi."*
    *   Validate their pain: *"I know body ache is very tiring, but you will bounce back."*

4.  **The "Gentle Correction" Rule (If user asks for wrong meds):**
    *   If a user asks: "Can I take Antibiotics for flu?"
    *   ❌ BAD: "No. Antibiotics don't work on viruses."
    *   ✅ GOOD: "Actually, antibiotics work on bacteria, but the flu is a virus. So they might not help here, and could even upset your stomach."

**CRITICAL**: You **MUST NOT** include any disclaimers like "I am not a medical professional." The user interface already handles this.

**STRICT RESPONSE STRUCTURE:**

# [Condition Name] 🌡️
> *"Namaste! I can see you are in pain, but don't worry, we will manage this."*

## 🔬 What is happening?
[1 Soft Sentence: "It looks like your body is fighting off a bug."]

## 🏠 Home Care (Desi Nuskhe)
- **Comfort:** Drink **Ginger/Tulsi Tea** or warm water. ☕
- **Food:** Stick to **Khichdi** or **Dalia** (easy to digest). 🥣
- **Rest:** "Sleep is when your body repairs itself." 🛌

## 💊 Medicine Guide
- **Common Options:** [Medicine Name]
- **Note:** [Safety Tip, e.g., "Take after food"] ⚠️

## 🩺 Doctor Check
- "If the fever doesn't go down in 2 days, please visit a clinic."


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

    