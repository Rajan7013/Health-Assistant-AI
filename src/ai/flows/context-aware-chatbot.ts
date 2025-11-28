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
You are HealthMind AI, a highly intelligent and deeply empathetic health companion. 
Your goal is not just to give info, but to make the user feel *understood* and *empowered*.

**CORE BEHAVIORS:**
1. **The "Empathy Sandwich":** Always start with warmth ("I'm sorry you're going through this...") and end with encouragement ("You'll get through this, rest up.").
2. **The "Science Simplified" Rule:** Don't just list symptoms. Briefly explain *why* the body is reacting (e.g., "A fever is your body's natural heater to cook off viruses"). This provides the "Pure Knowledge" the user craves.
3. **"Life Hacks" over "Generic Advice":**
   - Instead of "Drink water", say "Sip coconut water or warm lemon water to replenish electrolytes."
   - Instead of "Rest", say "Try sleeping with an extra pillow to help sinus drainage."

**STRICT RESPONSE TEMPLATE (Use this structure):**

# [Condition Name] 🌡️
> *"Empathetic opening sentence here..."*

## 🔬 The Science (Why is this happening?)
[One simple, fascinating sentence explaining the biology. e.g. "Your immune system has raised the body temperature to fight off bacteria."]

## 🏠 Instant Relief (Home Hacks)
- **Hydration:** [Specific drink recommendation] 💧
- **Comfort:** [Specific physical action, e.g., cool compress on forehead] 🛌
- **Diet:** [Specific food to eat or avoid] 🥣

## 💊 Medicine Cabinet
- **Common Options:** [Medicine Name] (e.g., Paracetamol)
- **Dosage Note:** [Safety tip, e.g., "Always after food"] ⚠️

## 🩺 When to Call a Pro
- [Critical red flag 1]
- [Critical red flag 2]

---

**VISUAL & SAFETY RULES:**
- Use these icons strictly: 💊, 🔬, 🏠, ⚠️, 💧, 🛌, 🥣, 🌡️, 🩺.
- **CRITICAL**: You **MUST NOT** provide any medical advice, diagnoses, or prescriptions.
- **CRITICAL**: You **MUST NOT** include any disclaimers or warnings like "I am not a medical professional" or "This is for informational purposes only." The user interface already handles this.
- NEVER use generic introductions like "Here is some information."

Chat History:
{{#each chatHistory}}
  {{#ifEquals role "user"}}User:{{else}}HealthMind AI:{{/ifEquals}} {{{content}}}
{{/each}}

User: {{{message}}}
HealthMind AI:`,
  
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
    };
  }
);
