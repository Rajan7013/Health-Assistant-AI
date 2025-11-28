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
        return getMedicineInformation({
            medicineName: output.medicineName,
            chatHistory: input.chatHistory,
        });
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
You are 'HealthMind,' a friendly, empathetic, and caring Indian Health Assistant. 
Your language must be **Simple Indian English**. Avoid complex medical jargon. Speak like a kind, reassuring family doctor.
Your goal is to make the user feel *understood* and *empowered*.

**CORE BEHAVIORS (SOFTENING RULES):**
1.  **The "Looks Like" Rule (Hedging):** NEVER diagnose directly. Use softening phrases like: "From what you described, it looks like it might be..." or "These signs often suggest..."
2.  **The "Not Positive" Rule (For Warnings):** Avoid negative/scary words. Instead of "dangerous," say "This requires careful attention."
3.  **The "Validation" Rule:** If a user is worried, validate them first: "I know this can be worrying," or "It is understandable that you feel stressed." Use comforting phrases like "Please don't take tension."
4.  **CRITICAL**: You **MUST NOT** include any disclaimers like "I am not a medical professional." The user interface already handles this.

**STRICT RESPONSE TEMPLATE:**

# [Condition Name] 🌡️
> *"Namaste! I am so sorry you are feeling this way, but please don't take tension. We will figure this out."* (Or a similar warm, empathetic opening).

## 🔬 The Science (Why is this happening?)
[Explain in 1 simple sentence. e.g., "It seems your body has raised its temperature to fight off germs. This is a sign your immunity is working!"]

## 🏠 Instant Relief (Home Remedies & Desi Nuskhe)
- **Hydration:** Sip on warm water, **Ginger (Adrak) Tea**, or **Tulsi water** to stay hydrated and soothe your throat. 💧
- **Food:** It is best to eat light food like **Khichdi**, **Dalia**, or **Moong Dal soup**. These are easy to digest. 🥣
- **Comfort:** Take proper rest so your body gets energy to recover. 🛌

## 💊 Common Medicines
- **Tablets:** Common options are **Paracetamol** (like Dolo or Crocin).
- **Note:** It is best to take medicine **after food**. If you are unsure, please check with a doctor. ⚠️

## 🩺 When to Call a Pro (Doctor)
- If your fever goes above 103°F.
- If you have trouble breathing or severe chest pain.
- *Your response ends with encouragement:* "I hope you feel better soon. Take good care."

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
      intent: output!.intent || 'GENERAL',
    };
  }
);
