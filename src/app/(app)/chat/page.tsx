'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { contextAwareChatbot, ContextAwareChatbotInput } from '@/ai/flows/context-aware-chatbot';
import { Logo } from '@/components/icons';
import { Bot, Send, User, Loader2 } from 'lucide-react';

type MessageIntent = 'MEDICINE' | 'SYMPTOM' | 'GENERAL' | 'EMERGENCY';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: MessageIntent;
}

const SmartChips = ({ intent, onSelect }: { intent: MessageIntent, onSelect: (text: string) => void }) => {
  let chips: string[] = [];
  
  if (intent === 'MEDICINE') {
    chips = ["💊 How to take it?", "⚠️ Any side effects?", "🏠 Natural alternative?"];
  } else if (intent === 'SYMPTOM') {
    chips = ["🥣 What should I eat?", "🛌 How many days to rest?", "🩺 Is this serious?"];
  } else if (intent === 'EMERGENCY') {
    chips = ["📞 Call Ambulance", "🏥 Find Hospital"];
  } else {
    chips = ["Tell me more", "Explain simply"];
  }

  return (
    <div className="mt-3 ml-1 max-w-[85%]">
        <p className="text-xs text-muted-foreground font-medium mb-2">Suggested Questions:</p>
        <div className="flex flex-row flex-wrap gap-2">
            {chips.map((chip, index) => (
                <button 
                    key={index} 
                    onClick={() => onSelect(chip)}
                    className="px-3 py-1.5 text-xs font-semibold text-primary bg-white border border-primary rounded-full hover:bg-primary/10 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                {chip}
                </button>
            ))}
        </div>
    </div>
  );
};


const MedicalDisclaimer = () => (
    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-2 text-center text-xs text-amber-700 dark:text-amber-300">
        ⚠️ AI is for information only. In emergencies, contact a doctor.
    </div>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
  
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear the main input if we're sending its content
    if (messageContent === input) {
        setInput('');
    }
    
    setIsLoading(true);
  
    try {
      const chatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
      
      const payload: ContextAwareChatbotInput = {
        message: messageContent,
        chatHistory: chatHistory,
      };
  
      const result = await contextAwareChatbot(payload);
      
      const assistantMessage: Message = { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: result.response,
        intent: result.intent,
      };
      setMessages((prev) => [...prev, assistantMessage]);
  
    } catch (error) {
      console.error('Error with chatbot:', error);
      const errorMessage: Message = { id: 'error-' + Date.now(), role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };
  
  const handleChipSelect = (chipText: string) => {
    // We don't set the input, just send the message directly
    handleSendMessage(chipText);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        {messages.length === 0 && (
            <div className='p-4 pt-0'>
                <MedicalDisclaimer />
            </div>
        )}
      <ScrollArea className="flex-1 p-4 pt-0" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="space-y-4 text-center text-muted-foreground mt-8">
              <Bot className="mx-auto h-12 w-12" />
              <h2 className="text-2xl font-semibold">HealthMind AI</h2>
              <p>Your personal AI health assistant. Ask me about medicines, diseases, and more.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 border">
                   <div className="bg-primary flex items-center justify-center h-full w-full">
                     <Logo className="h-5 w-5 text-primary-foreground" />
                   </div>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-prose rounded-lg p-3 text-sm shadow-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                )}
              >
                <article className="prose prose-sm dark:prose-invert prose-p:my-2 prose-headings:my-3 break-words">
                   <ReactMarkdown
                     components={{
                        a: ({node, ...props}) => <a className="text-primary underline hover:opacity-80" {...props} />,
                      }}
                   >
                    {message.content}
                    </ReactMarkdown>
                </article>
                {message.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                    <SmartChips intent={message.intent || 'GENERAL'} onSelect={handleChipSelect} />
                )}
              </div>
              {message.role === 'user' && (
                 <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="h-8 w-8 border">
                <div className="bg-primary flex items-center justify-center h-full w-full">
                  <Logo className="h-5 w-5 text-primary-foreground" />
                </div>
              </Avatar>
              <div className="max-w-md rounded-lg p-3 text-sm shadow-sm bg-card flex items-center">
                 <Loader2 className="h-4 w-4 animate-spin" />
                 <span className="ml-2 animate-pulse">...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-card p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a medicine or symptom..."
            className="flex-1"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

    