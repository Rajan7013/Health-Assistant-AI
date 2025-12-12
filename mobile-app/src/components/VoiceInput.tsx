import { useState } from 'react';
import { View, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from '../lib/utils';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    color?: string;
}

export default function VoiceInput({ onTranscript, color = '#3B82F6' }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);

    const handleVoiceInput = () => {
        // Check if SpeechRecognition is available (web only in Expo Go)
        if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
            };

            recognition.onerror = (event: any) => {
                setIsListening(false);
                Alert.alert('Error', 'Voice recognition failed. Please try again.');
            };

            recognition.start();
        } else {
            // Show message for native platforms
            Alert.alert(
                'Voice Input',
                'Voice recognition requires a development build.\n\nTo use this feature:\n1. Build development build with: npx expo prebuild\n2. Run: npx expo run:android\n\nFor now, please type your query.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <TouchableOpacity
            onPress={handleVoiceInput}
            style={tw`w-12 h-12 bg-${isListening ? 'red' : 'blue'}-50 rounded-xl items-center justify-center ${isListening ? 'animate-pulse' : ''}`}
        >
            <Ionicons
                name={isListening ? "mic" : "mic-outline"}
                size={24}
                color={isListening ? '#EF4444' : color}
            />
        </TouchableOpacity>
    );
}
