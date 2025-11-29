
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { contextAwareChatbot, type ContextAwareChatbotInput } from '@/ai/flows/context-aware-chatbot';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Bot, Send, User, Loader2, Sparkles, Volume2, Pause } from 'lucide-react';

type MessageIntent = 'MEDICINE' | 'SYMPTOM' | 'GENERAL' | 'EMERGENCY';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: MessageIntent;
  audioDataUri?: string | null;
  isAudioLoading?: boolean;
}

const SmartChips = ({ intent, onSelect }: { intent: MessageIntent, onSelect: (text: string) => void }) => {
  let chips: string[] = [];
  
  if (intent === 'MEDICINE') {
    chips = ["How should I take this?", "What are the side effects?", "Is there a natural alternative?"];
  } else if (intent === 'SYMPTOM') {
    chips = ["What kind of food should I eat?", "How many days should I rest?", "When should I see a doctor?"];
  } else if (intent === 'EMERGENCY') {
    chips = ["Call Ambulance", "Find Nearest Hospital"];
  } else {
    chips = ["Explain this more simply", "Tell me more about that"];
  }

  return (
    <div className="mt-4 ml-1 max-w-[85%]">
        <p className="text-xs text-muted-foreground font-medium mb-2">Suggested Replies:</p>
        <div className="flex flex-row flex-wrap gap-2">
            {chips.map((chip, index) => (
                <button 
                    key={index} 
                    onClick={() => onSelect(chip)}
                    className="px-3 py-1.5 text-xs font-semibold text-primary bg-background border border-primary/30 rounded-full hover:bg-primary/10 transition-all duration-200 transform hover:scale-105"
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
        AI is for informational purposes only. In case of a medical emergency, please contact a qualified doctor.
    </div>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleAudioEnded = () => {
    setPlayingMessageId(null);
  };
  
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', handleAudioEnded);
      audioElement.addEventListener('pause', handleAudioEnded); // Also stop when paused
      return () => {
        audioElement.removeEventListener('ended', handleAudioEnded);
        audioElement.removeEventListener('pause', handleAudioEnded);
      };
    }
  }, [audioRef]);


  const handlePlayAudio = async (message: Message) => {
    const { id, content } = message;
    let { audioDataUri } = message;

    // If this message is already playing, pause it.
    if (playingMessageId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingMessageId(null);
      return;
    }

    // If we already have the audio, play it.
    if (audioDataUri && audioRef.current) {
      audioRef.current.src = audioDataUri;
      audioRef.current.play();
      setPlayingMessageId(id);
      return;
    }

    // If we don't have the audio, fetch it now (either for the first time or retrying).
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isAudioLoading: true } : msg));
    try {
      const result = await textToSpeech(content);
      audioDataUri = result.audioDataUri;
      
      if (!audioDataUri) {
          throw new Error("Failed to generate audio.");
      }

      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, audioDataUri, isAudioLoading: false } : msg));

      // Play the newly fetched audio
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
        setPlayingMessageId(id);
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, isAudioLoading: false } : msg));
    }
  };
  
  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
  
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    
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
      
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = { 
        id: assistantMessageId,
        role: 'assistant', 
        content: result.response,
        intent: result.intent,
        audioDataUri: null,
        isAudioLoading: false, // Start as false
      };
      setMessages((prev) => [...prev, assistantMessage]);
  
      // Proactively generate audio
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, isAudioLoading: true } : msg));
      textToSpeech(result.response)
        .then(({ audioDataUri }) => {
          if (audioDataUri) {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, audioDataUri, isAudioLoading: false } : msg
            ));
          } else {
            // Handle case where pre-fetch returns no audio
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId ? { ...msg, isAudioLoading: false } : msg
            ));
          }
        })
        .catch(error => {
          console.error("Error pre-fetching speech:", error);
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, isAudioLoading: false } : msg
          ));
        });

    } catch (error) {
      console.error('Error with chatbot:', error);
      const errorMessage: Message = { id: 'error-' + Date.now(), role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." };
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
    handleSendMessage(chipText);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-background rounded-2xl shadow-2xl border">
      <audio ref={audioRef} />
        {messages.length > 0 && (
            <div className='p-4 pb-0'>
                <MedicalDisclaimer />
            </div>
        )}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-16">
              <div className="relative mb-4">
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse-slow"></div>
                 <Bot className="relative h-20 w-20 text-primary animate-pulse-slow-bounce" />
              </div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">HealthMind AI</h2>
              <p className="mt-2 max-w-sm">Your personal AI health assistant. Ask me about medicines, diseases, and more.</p>
               <div className='p-4 pt-8 w-full max-w-md'>
                <MedicalDisclaimer />
            </div>
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
                <Avatar className="h-8 w-8 border-2 border-primary/50 shadow-lg">
                   <div className="bg-primary flex items-center justify-center h-full w-full">
                     <Sparkles className="h-5 w-5 text-primary-foreground" />
                   </div>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl text-sm shadow-md group relative',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-lg p-4'
                    : 'bg-card border rounded-bl-lg'
                )}
              >
                 {message.role === 'assistant' && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-background border text-primary opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        onClick={() => handlePlayAudio(message)}
                        disabled={message.isAudioLoading}
                    >
                        {message.isAudioLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : playingMessageId === message.id ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </Button>
                )}
                <div className={cn(message.role === 'assistant' && 'p-4')}>
                  <article className="prose prose-sm dark:prose-invert prose-p:my-2 prose-headings:my-3 break-words">
                    <ReactMarkdown
                      components={{
                          a: ({node, ...props}) => <a className="text-primary underline hover:opacity-80" {...props} />,
                        }}
                    >
                      {message.content}
                      </ReactMarkdown>
                  </article>
                </div>

                {message.role === 'assistant' && index === messages.length - 1 && !isLoading && (
                    <div className="p-4 pt-0">
                      <SmartChips intent={message.intent || 'GENERAL'} onSelect={handleChipSelect} />
                    </div>
                )}
              </div>
              {message.role === 'user' && (
                 <Avatar className="h-8 w-8 shadow-lg">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="h-8 w-8 border-2 border-primary/50 shadow-lg">
                 <div className="bg-primary flex items-center justify-center h-full w-full">
                   <Sparkles className="h-5 w-5 text-primary-foreground" />
                 </div>
              </Avatar>
              <div className="max-w-md rounded-2xl p-3 text-sm shadow-md bg-card flex items-center border">
                 <Loader2 className="h-4 w-4 animate-spin text-primary" />
                 <span className="ml-2 animate-pulse text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t bg-card p-4 rounded-b-2xl">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a medicine or describe a symptom..."
            className="flex-1 pr-12 h-12 text-base rounded-full"
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary hover:bg-primary/90 transition-opacity">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
