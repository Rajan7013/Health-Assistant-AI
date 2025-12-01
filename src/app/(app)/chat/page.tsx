'use client';

import React, { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { Send, Sparkles, User, Loader2, Volume2, Pause, AlertCircle, X, RotateCcw, Menu, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import SmartChips from '@/components/SmartChips';
import VoiceInput from '@/components/VoiceInput';
import ChatHistory from '@/components/ChatHistory';
import { useUser } from '@/firebase/auth/use-user';
import {
  createChat,
  addMessage,
  subscribeToMessages,
  ChatMessage
} from '@/firebase/firestore/chats';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  timestamp: number;
}

const MedicalDisclaimer = () => (
  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
    <AlertCircle className="h-3 w-3 shrink-0" />
    <p className="text-[10px] font-medium leading-tight">
      <strong>Medical Disclaimer:</strong> AI provides general info only. Consult a doctor for medical advice.
    </p>
  </div>
);

const WelcomeScreen = ({ onPromptSelect }: { onPromptSelect: (text: string) => void }) => {
  const prompts = [
    { icon: "🤒", text: "What are the symptoms of flu?" },
    { icon: "🥗", text: "Give me a healthy diet plan." },
    { icon: "💊", text: "Remind me to take my meds." },
    { icon: "🧠", text: "Tips for mental wellness." },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-xl mb-6">
        <Sparkles className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-black text-[#0A1D42] mb-2">Welcome to HealthMind AI</h1>
      <p className="text-gray-500 max-w-md mb-8 font-medium">
        Your personal health assistant. I can help you check symptoms, manage medications, and answer health questions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt.text)}
            className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200 hover:bg-purple-50/50 transition-all text-left group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{prompt.icon}</span>
            <span className="text-sm font-bold text-gray-700 group-hover:text-purple-700">{prompt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioLoadingMessageId, setAudioLoadingMessageId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Subscribe to messages when chat changes
  useEffect(() => {
    // Track page view
    import('@/lib/analytics').then(({ trackPageView }) => {
      trackPageView('chat_page');
    });

    if (!user || !currentChatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(user.uid, currentChatId, (chatMessages) => {
      setMessages(chatMessages.map(msg => ({
        id: msg.id || Date.now().toString(),
        role: msg.role,
        content: msg.content,
        intent: msg.intent,
        timestamp: msg.timestamp
      })));
    });

    return () => unsubscribe();
  }, [user, currentChatId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handlePlayAudio = useCallback(async (message: Message) => {
    if (playingMessageId === message.id) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }

    setAudioLoadingMessageId(message.id);
    setAudioError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content }),
      });

      if (!response.ok) throw new Error('Failed to generate audio');

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setPlayingMessageId(message.id);
      }
    } catch (error) {
      console.error("Error in handlePlayAudio:", error);
      setAudioError('Audio playback failed');
    } finally {
      setAudioLoadingMessageId(null);
    }
  }, [playingMessageId]);

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + text);
  };


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

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setIsMobileMenuOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsMobileMenuOpen(false);
  };

  const handleSendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !user) return;

    // Optimistic update for UI responsiveness
    const tempUserMessage: Message = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    // Only set optimistic message if we're not in a chat yet (otherwise subscription handles it)
    if (!currentChatId) {
      setMessages(prev => [...prev, tempUserMessage]);
    }

    if (messageContent === input) {
      setInput('');
    }

    setIsLoading(true);
    setError(null);

    // Track message sent
    import('@/lib/analytics').then(({ logEvent }) => {
      logEvent('chat_message_sent', { length: messageContent.length });
    });

    try {
      let chatId = currentChatId;

      // Create new chat if needed
      if (!chatId) {
        chatId = await createChat(user.uid, messageContent);
        setCurrentChatId(chatId);
        import('@/lib/analytics').then(({ logEvent }) => {
          logEvent('chat_created', { chat_id: chatId });
        });
      }

      if (!chatId) throw new Error("Chat ID is missing");

      // Save user message to Firestore
      await addMessage(user.uid, chatId, {
        role: 'user',
        content: messageContent,
        timestamp: Date.now(),
      });

      // Prepare context for AI
      const chatHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

      const payload = {
        message: messageContent,
        chatHistory: chatHistory,
      };

      const token = await user.getIdToken();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(data.resetIn / 60)} minutes.`);
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      // Save assistant message to Firestore
      await addMessage(user.uid, chatId, {
        role: 'assistant',
        content: result.response,
        intent: result.intent,
        timestamp: Date.now(),
      });

      // Track successful response
      import('@/lib/analytics').then(({ logEvent }) => {
        logEvent('chat_response_received', {
          intent: result.intent,
          response_length: result.response.length
        });
      });

    } catch (error) {
      console.error('Error with chatbot:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to get response: ${errorMsg}`);

      // Track error
      import('@/lib/analytics').then(({ trackError }) => {
        trackError(errorMsg, 'ChatPage');
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, user, currentChatId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleChipSelect = (chipText: string) => {
    handleSendMessage(chipText);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-white overflow-hidden">
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      {/* Sidebar - Desktop */}
      <div className={cn(
        "hidden md:block h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200",
        isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-r-0"
      )}>
        <div className="w-64 h-full">
          {user && (
            <ChatHistory
              userId={user.uid}
              currentChatId={currentChatId}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">

        {/* Mobile Header with Menu */}
        <div className="md:hidden px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              {user && (
                <ChatHistory
                  userId={user.uid}
                  currentChatId={currentChatId}
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                />
              )}
            </SheetContent>
          </Sheet>
          <span className="font-bold text-sm text-gray-700">HealthMind AI</span>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        {/* Status Bar (Desktop: Full, Mobile: Compact) */}
        <div className="hidden md:flex px-4 py-2 border-b border-gray-200 items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-8 w-8 text-gray-500 hover:bg-gray-100"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse">
              <span className="text-xs font-bold text-green-600 whitespace-nowrap ml-2">
                AI Active
              </span>
            </div>
          </div>

          <div className="flex-1 flex justify-center px-2 overflow-hidden">
            <p className="text-[10px] text-amber-600/90 font-medium truncate text-center">
              <span className="font-bold">Disclaimer:</span> For emergencies, call emergency services. Always consult healthcare professionals.
            </p>
          </div>

          <div className="w-24 flex justify-end shrink-0">
            <Button
              variant="ghost"
              onClick={handleNewChat}
              className="text-xs text-purple-600 font-semibold flex items-center gap-1.5 hover:text-purple-700 hover:bg-purple-50 transition h-7 px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {(error || audioError) && (
          <Alert variant="destructive" className="mx-8 mt-4">
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

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-6 bg-white" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <WelcomeScreen onPromptSelect={handleChipSelect} />
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-black text-lg md:text-2xl flex-shrink-0 shadow-lg">
                      <Sparkles className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] md:max-w-3xl rounded-3xl shadow-md transition-all relative group overflow-hidden',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-black rounded-tr-none px-5 py-3 md:px-6 md:py-4'
                        : 'bg-gradient-to-r from-blue-500 via-green-500 to-red-500 p-[2px] rounded-tl-none'
                    )}
                  >
                    <div className={cn(
                      "h-full w-full rounded-[22px]",
                      message.role === 'assistant' ? "bg-white px-5 py-3 md:px-6 md:py-4" : ""
                    )}>
                      {message.role === 'assistant' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-gray-200 text-purple-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-50 shadow-sm z-10"
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

                      <div
                        className={cn('font-medium', message.role === 'assistant' ? 'text-sm leading-normal' : 'text-sm')}
                        style={{ color: '#000000' }}
                      >
                        {message.role === 'assistant' ? (
                          <article className="prose prose-sm max-w-none break-words">
                            <ReactMarkdown
                              components={{
                                a: ({ node, ...props }) => (
                                  <a className="underline hover:opacity-80 font-bold text-purple-700" target="_blank" rel="noopener noreferrer" {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                  <p className="mb-2 last:mb-0 !text-black" style={{ color: '#000000' }} {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                  <li className="!text-black" style={{ color: '#000000' }} {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                  <strong className="font-black !text-black" style={{ color: '#000000' }} {...props} />
                                ),
                                h1: ({ node, ...props }) => (
                                  <h1 className="font-black !text-black" style={{ color: '#000000' }} {...props} />
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2 className="font-black !text-black" style={{ color: '#000000' }} {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                  <h3 className="font-black !text-black" style={{ color: '#000000' }} {...props} />
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </article>
                        ) : (
                          <span className="!text-black" style={{ color: '#000000' }}>{message.content}</span>
                        )}
                      </div>

                      {message.role === 'assistant' && index === messages.length - 1 && !isLoading && message.intent && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <SmartChips intent={message.intent} onSelect={handleChipSelect} />
                        </div>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-lg md:text-2xl flex-shrink-0 shadow-lg">
                      <User className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-black text-lg md:text-2xl flex-shrink-0 shadow-lg">
                    <Sparkles className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <div className="bg-gray-100 rounded-3xl rounded-tl-none px-8 py-6 shadow-md border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area - Ultra Compact */}
        <div className="bg-white border-t border-gray-200 px-4 py-1.5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10">
          <div className="max-w-4xl mx-auto space-y-0.5">
            <form onSubmit={handleSubmit} className="flex gap-2 relative items-center">
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} className="shrink-0" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your health question..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all !text-black placeholder-gray-400 text-xs h-8 font-medium"
                style={{ color: '#000000' }}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all hover:shadow-md active:scale-95 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
            <p className="text-[8px] text-gray-400 text-center">
              AI may make mistakes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
