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
import { textToSpeechStream } from '@/ai/flows/text-to-speech-stream';
import { Bot, Send, User, Loader2, Sparkles, Volume2, Pause, AlertCircle, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type MessageIntent = 'MEDICINE' | 'SYMPTOM' | 'GENERAL' | 'EMERGENCY';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: MessageIntent;
  timestamp: number;
}

const SmartChips = ({ intent, onSelect }: { intent: MessageIntent, onSelect: (text: string) => void }) => {
  let chips: string[] = [];
  
  if (intent === 'MEDICINE') {
    chips = ["How should I take this?", "What are the side effects?", "Can I take this with food?"];
  } else if (intent === 'SYMPTOM') {
    chips = ["What foods help recovery?", "When should I see a doctor?", "How long will this last?"];
  } else if (intent === 'EMERGENCY') {
    chips = ["Find nearest hospital", "Call emergency services", "What should I do now?"];
  } else {
    chips = ["Explain more simply", "Tell me more", "What else should I know?"];
  }

  return (
    <div className="mt-4 ml-1 max-w-full">
      <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Quick questions:
      </p>
      <div className="flex flex-row flex-wrap gap-2">
        {chips.map((chip, index) => (
          <button 
            key={index} 
            onClick={() => onSelect(chip)}
            className="px-3 py-1.5 text-xs font-medium text-primary bg-background border border-primary/30 rounded-full hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};

const MedicalDisclaimer = () => (
  <Alert className="border-amber-500/50 bg-amber-500/10">
    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
      <strong>Medical Disclaimer:</strong> This AI provides general health information only. 
      For medical emergencies, call emergency services. Always consult qualified healthcare professionals for diagnosis and treatment.
    </AlertDescription>
  </Alert>
);

const WelcomeScreen = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
      <div className="relative bg-gradient-to-br from-primary to-blue-500 p-4 rounded-full shadow-2xl">
        <Bot className="h-16 w-16 text-white" />
      </div>
    </div>
    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-500 mb-2">
      HealthMind AI
    </h2>
    <p className="text-muted-foreground max-w-md mb-8">
      Your intelligent health companion. Ask about medications, symptoms, wellness tips, and more.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
      <div className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-all">
        <div className="text-2xl mb-2">💊</div>
        <h3 className="font-semibold mb-1">Medications</h3>
        <p className="text-xs text-muted-foreground">Learn about drugs, dosages, and interactions</p>
      </div>
      <div className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-all">
        <div className="text-2xl mb-2">🩺</div>
        <h3 className="font-semibold mb-1">Symptoms</h3>
        <p className="text-xs text-muted-foreground">Understand symptoms and when to seek care</p>
      </div>
      <div className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-all">
        <div className="text-2xl mb-2">🏥</div>
        <h3 className="font-semibold mb-1">Health Tips</h3>
        <p className="text-xs text-muted-foreground">Get wellness advice and preventive care info</p>
      </div>
    </div>
    
    <div className="w-full max-w-md">
      <MedicalDisclaimer />
    </div>
  </div>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioLoadingMessageId, setAudioLoadingMessageId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);
  
  const handlePlayAudio = useCallback(async (message: Message) => {
    const { id, content } = message;
    const audioElement = audioRef.current;
  
    if (!audioElement) {
      console.error("Audio element not found");
      setAudioError("Audio system not available");
      return;
    }
  
    // If clicking on currently playing message, pause it
    if (playingMessageId === id) {
      audioElement.pause();
      setPlayingMessageId(null);
      return;
    }
  
    // Stop any currently playing audio
    if (playingMessageId) {
      audioElement.pause();
      if (mediaSourceRef.current?.readyState === 'open') {
        try {
          mediaSourceRef.current.endOfStream();
        } catch (e) {
          console.error('Error ending previous stream:', e);
        }
      }
      if (audioElement.src) {
        URL.revokeObjectURL(audioElement.src);
      }
    }
  
    setAudioLoadingMessageId(id);
    setAudioError(null);
  
    try {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      const url = URL.createObjectURL(mediaSource);
      audioElement.src = url;
  
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('MediaSource timeout')), 5000);
        
        mediaSource.addEventListener('sourceopen', async () => {
          clearTimeout(timeout);
          try {
            sourceBufferRef.current = mediaSource.addSourceBuffer('audio/mpeg');
            const sourceBuffer = sourceBufferRef.current;
            const audioChunks: Buffer[] = [];
            
            const stream = textToSpeechStream(content);
            
            for await (const chunk of stream) {
              audioChunks.push(chunk);
            }
            
            // Append all chunks
            for (const chunk of audioChunks) {
              if (mediaSource.readyState !== 'open') break;
              
              sourceBuffer.appendBuffer(chunk);
              await new Promise((res) => {
                sourceBuffer.addEventListener('updateend', res, { once: true });
              });
            }
            
            if (mediaSource.readyState === 'open') {
              mediaSource.endOfStream();
            }
            
            resolve();
          } catch (e) {
            console.error('Error in sourceopen handler:', e);
            reject(e);
          }
        }, { once: true });
        
        mediaSource.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(new Error('MediaSource error'));
        }, { once: true });
      });
  
      await audioElement.play();
      setPlayingMessageId(id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Audio playback failed';
      console.error("Error in handlePlayAudio:", errorMessage);
      setAudioError(errorMessage);
      setPlayingMessageId(null);
      setTimeout(() => setAudioError(null), 5000);
    } finally {
      setAudioLoadingMessageId(null);
    }
  }, [playingMessageId]);

  const handleAudioEnded = useCallback(() => {
    setPlayingMessageId(null);
    if (audioRef.current?.src) {
      URL.revokeObjectURL(audioRef.current.src);
    }
  }, []);
  
  const handleAudioError = useCallback(() => {
    setPlayingMessageId(null);
    setAudioError('Audio playback error');
    setTimeout(() => setAudioError(null), 5000);
  }, []);

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
  
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: messageContent,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    if (messageContent === input) {
      setInput('');
    }
    
    setIsLoading(true);
    setError(null);
  
    try {
      const chatHistory = messages.map(msg => ({ 
        role: msg.role, 
        content: msg.content 
      }));
      
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
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error with chatbot:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to get response: ${errorMsg}`);
      
      const errorMessage: Message = { 
        id: 'error-' + Date.now(), 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment, or rephrase your question.",
        timestamp: Date.now(),
      };
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
  
  const clearChat = () => {
    setMessages([]);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    }
    setPlayingMessageId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-gradient-to-b from-background to-muted/20 rounded-2xl shadow-2xl border overflow-hidden">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />
      
      {/* Header */}
      {messages.length > 0 && (
        <div className="p-4 pb-3 space-y-2 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium">AI Active</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              New Chat
            </Button>
          </div>
          <MedicalDisclaimer />
        </div>
      )}
      
      {/* Error Alert */}
      {(error || audioError) && (
        <Alert variant="destructive" className="mx-4 mt-3 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs flex items-center justify-between">
            <span>{error || audioError}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setError(null); setAudioError(null); }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 pb-4">
          {messages.length === 0 && <WelcomeScreen />}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-9 w-9 border-2 border-primary/50 shadow-lg">
                  <div className="bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center h-full w-full">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </Avatar>
              )}
              
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl text-sm shadow-lg group relative',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md p-4'
                    : 'bg-card border rounded-bl-md'
                )}
              >
                {message.role === 'assistant' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-primary/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50 shadow-md"
                    onClick={() => handlePlayAudio(message)}
                    disabled={audioLoadingMessageId === message.id}
                    title={playingMessageId === message.id ? "Pause" : "Play"}
                  >
                    {audioLoadingMessageId === message.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : playingMessageId === message.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                <div className={cn(message.role === 'assistant' && 'p-4')}>
                  <article className="prose prose-sm dark:prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 break-words max-w-none">
                    <ReactMarkdown
                      components={{
                        a: ({node, ...props}) => (
                          <a className="text-primary underline hover:opacity-80 font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </article>
                </div>

                {message.role === 'assistant' && index === messages.length - 1 && !isLoading && message.intent && (
                  <div className="px-4 pb-4">
                    <SmartChips intent={message.intent} onSelect={handleChipSelect} />
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-9 w-9 shadow-lg border-2 border-muted">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500">
                    <User className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Avatar className="h-9 w-9 border-2 border-primary/50 shadow-lg">
                <div className="bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center h-full w-full">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </Avatar>
              <div className="max-w-md rounded-2xl p-4 text-sm shadow-lg bg-card border flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                </div>
                <span className="text-muted-foreground">Thinking</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="border-t bg-card/80 backdrop-blur-sm p-4 rounded-b-2xl">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms or ask about medications..."
            className="flex-1 pr-14 h-12 text-base rounded-full border-2 focus:border-primary transition-colors"
            disabled={isLoading}
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()} 
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-gradient-to-br from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send • AI may make mistakes
        </p>
      </div>
    </div>
  );
}
