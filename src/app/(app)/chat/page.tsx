"use client";

import { useState, useRef, useEffect, createElement } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { contextAwareChatbot, ContextAwareChatbotInput } from '@/ai/flows/context-aware-chatbot';
import * as LucideIcons from 'lucide-react';
import { Logo } from '@/components/icons';

const { Bot, Send, User, Loader2, AlertTriangle } = LucideIcons;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatDisclaimer = () => (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>
            I am an AI assistant and not a substitute for a real medical professional. Please consult with a doctor for any medical advice.
        </p>
    </div>
)

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
      
      const payload: ContextAwareChatbotInput = {
        message: input,
        chatHistory: chatHistory,
      };

      const result = await contextAwareChatbot(payload);
      
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error with chatbot:', error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string): ReactNode[] => {
    // Regex for bold, links, and icons
    const regex = /(\*\*.*?\*\*)|(\[.*?\]\(https?:\/\/[^\s)]+\))|(\[ICON:([a-zA-Z]+)\])/g;

    const parts = content.split(regex);
    let keyIndex = 0;

    return parts.filter(part => part).map((part, index) => {
      keyIndex++;

      // Handle bold: **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={keyIndex}>{part.substring(2, part.length - 2)}</strong>;
      }

      // Handle links: [text](url)
      const linkMatch = part.match(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        const text = linkMatch[1];
        const url = linkMatch[2];
        return (
          <a
            key={keyIndex}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80"
          >
            {text}
          </a>
        );
      }
      
      // Handle icons: [ICON:Name]
      const iconMatch = part.match(/\[ICON:([a-zA-Z]+)\]/);
      if (iconMatch) {
        const iconName = iconMatch[1] as keyof typeof LucideIcons;
        const IconComponent = LucideIcons[iconName];
        if (IconComponent) {
          return createElement(IconComponent, { key: keyIndex, className: 'inline-block h-4 w-4 mx-1' });
        }
      }

      // Handle regular text
      return <span key={keyIndex}>{part}</span>;
    });
  }


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="space-y-6 text-center text-muted-foreground">
              <Bot className="mx-auto h-12 w-12" />
              <h2 className="text-2xl font-semibold">MediAssistant AI Chat</h2>
              <p>Ask me about medicines, diseases, dosages, and more.</p>
              <ChatDisclaimer />
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
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
                  'max-w-md rounded-lg p-3 text-sm shadow-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card'
                )}
              >
                <div className="prose prose-sm dark:prose-invert break-words">
                  {renderMessageContent(message.content)}
                </div>
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
