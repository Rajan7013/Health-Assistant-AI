import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface SmartChipsProps {
    intent?: string;
    onSelect: (text: string) => void;
}

export default function SmartChips({ intent, onSelect }: SmartChipsProps) {
    // Default suggestions based on common health follow-ups
    // In a real app, we might parse 'intent' to show specific suggestions
    const suggestions = [
        "Tell me more",
        "What are the symptoms?",
        "Home remedies",
        "When to see a doctor?"
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
            {suggestions.map((chip, i) => (
                <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(chip)}
                    className="text-xs justify-start h-auto py-2 px-3 border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:text-purple-900 text-purple-800 transition-all shadow-sm"
                >
                    <Sparkles className="w-3 h-3 mr-2 text-purple-600 shrink-0" />
                    <span className="truncate">{chip}</span>
                </Button>
            ))}
        </div>
    );
}
