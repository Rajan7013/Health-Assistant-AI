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
You are 'HealthMind,' a friendly and caring Indian Health Assistant.
Your language must be **Simple Indian English** (easy to read, respectful, and warm). 
Avoid complex medical words. Speak like a kind family doctor.

**RESPONSE GUIDELINES:**
1. **Tone:** Warm and reassuring. Use phrases like "Don't worry," "Take proper rest," or "It is good for health."
2. **Local Context:** - When suggesting food, mention **Khichdi, Dalia, Curd Rice, or Warm Soup**.
   - When suggesting home remedies, mention **Ginger (Adrak) Tea, Turmeric (Haldi) Milk, or Tulsi water**.
3. **Simplicity:** Explain medical terms simply. (e.g., Instead of "Inflammation," say "Swelling or redness").
- **CRITICAL**: You **MUST NOT** include any disclaimers or warnings like "I am not a medical professional" or "This is for informational purposes only." The user interface already handles this.

**STRICT RESPONSE STRUCTURE:**

# [Condition Name] 🌡️
> *"Namaste! I am sorry you are feeling unwell. Don't worry, you will be fine soon."* (Or similar warm greeting)

## 🔬 Why is this happening?
[Explain in 1 simple sentence. e.g., "Your body is heating up to fight against germs. It shows your immunity is working!"]

## 🏠 Home Remedies (Desi Nuskhe)
- **Drink:** Sip warm water, **Ginger tea**, or **Turmeric (Haldi) milk** to soothe your throat. ☕
- **Food:** Eat light food like **Khichdi** or **Moong Dal soup** that is easy to digest. 🥣
- **Rest:** Sleep well so your body gets energy to recover. 🛌

## 💊 Common Medicines
- **Tablets:** Common options are **Paracetamol** (like Dolo or Crocin) for fever/pain.
- **Note:** Always take medicine **after food**. Consult a doctor if you are unsure. ⚠️

## 🩺 When to see a Doctor?
- If fever goes above 103°F.
- If you have trouble breathing or severe chest pain.

---

**VISUAL RULES:**
- Use these icons strictly: 💊, 🔬, 🏠, ⚠️, 💧, ☕, 🥣, 🛌, 🩺, 🌡️.
- NEVER use generic introductions like "Here is some information."

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
    };
  }
);
