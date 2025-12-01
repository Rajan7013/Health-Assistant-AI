import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    className?: string;
    disabled?: boolean;
}

export default function VoiceInput({ onTranscript, className, disabled }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onstart = () => {
                    setIsListening(true);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    onTranscript(transcript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                    if (event.error === 'not-allowed') {
                        toast({
                            variant: "destructive",
                            title: "Microphone Access Denied",
                            description: "Please allow microphone access to use voice input."
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Voice Input Failed",
                            description: "Please try again."
                        });
                    }
                };
            } else {
                setIsSupported(false);
            }
        }
    }, [onTranscript, toast]);

    const toggleListening = () => {
        if (!isSupported) {
            toast({
                variant: "destructive",
                title: "Not Supported",
                description: "Voice input is not supported in this browser."
            });
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    if (!isSupported) return null;

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleListening}
            disabled={disabled}
            className={`rounded-full transition-all duration-300 ${isListening
                ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                : 'hover:bg-gray-100 text-gray-500 hover:text-blue-600'
                } ${className}`}
            title={isListening ? "Stop listening" : "Start voice input"}
        >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
    );
}
