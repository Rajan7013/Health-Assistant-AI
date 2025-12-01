'use client';

/**
 * Dynamic Medical Response Renderer
 * Provides context-aware styling and icons for medical content
 */

import React from 'react';
import {
    AlertTriangle, Info, Pill, Thermometer, Heart, Activity, Clock, Droplet,
    Apple, Bed, AlertCircle, CheckCircle, Shield, Stethoscope, Phone,
    Brain, Wind
} from 'lucide-react';

// Dynamic icon mapping based on content
const CONTENT_ICONS: Record<string, any> = {
    'fever|temperature|hot': Thermometer,
    'pain|ache|hurt|sore': AlertCircle,
    'heart|cardiac|chest': Heart,
    'breath|respiratory|lung|cough': Wind,
    'head|brain|migraine|headache': Brain,
    'medication|medicine|drug|pill|tablet|dose': Pill,
    'rest|sleep|bed': Bed,
    'water|hydration|fluid|drink': Droplet,
    'food|eat|nutrition|diet': Apple,
    'time|duration|hours|days|when': Clock,
    'emergency|urgent|critical|immediate': AlertTriangle,
    'protect|prevent|safety|care': Shield,
    'doctor|physician|hospital|medical': Stethoscope,
    'call|phone|contact': Phone,
    'understand|symptoms|what|why': Info,
};

// Get appropriate icon for content
function getIconForContent(text: string): any {
    const lowerText = text.toLowerCase();

    for (const [pattern, Icon] of Object.entries(CONTENT_ICONS)) {
        const keywords = pattern.split('|');
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return Icon;
        }
    }

    return Info;
}

// Enhanced markdown components with dynamic styling
export const DynamicMarkdownComponents = {
    h3: ({ node, children, ...props }: any) => {
        const text = String(children);
        const Icon = getIconForContent(text);

        return (
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-primary/20 mt-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm">
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground m-0" {...props}>
                    {children}
                </h3>
            </div>
        );
    },

    strong: ({ node, children, ...props }: any) => {
        const text = String(children).toLowerCase();

        let className = "font-bold";

        if (text.includes('immediate') || text.includes('emergency') || text.includes('critical')) {
            className = "font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1 rounded";
        } else if (text.includes('warning') || text.includes('important') || text.includes('caution')) {
            className = "font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 rounded";
        } else if (text.match(/\d+\s*(mg|ml|hours?|days?)/i)) {
            className = "font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded";
        } else if (text.includes('fever') || text.includes('pain')) {
            className = "font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1 rounded";
        } else if (text.includes('rest') || text.includes('drink')) {
            className = "font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1 rounded";
        } else {
            className = "font-bold text-foreground";
        }

        return <strong className={className} {...props}>{children}</strong>;
    },

    ul: ({ node, children, ...props }: any) => (
        <ul className="space-y-2.5 my-4 ml-1" {...props}>{children}</ul>
    ),

    li: ({ node, children, ...props }: any) => {
        const text = String(children);
        const Icon = getIconForContent(text);

        return (
            <li className="flex items-start gap-2.5 text-muted-foreground group" {...props}>
                <div className="mt-0.5 p-1 rounded-md bg-primary/5 text-primary flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1">{children}</span>
            </li>
        );
    },

    blockquote: ({ node, children, ...props }: any) => {
        const text = String(children).toLowerCase();

        let bgColor = "bg-blue-50 dark:bg-blue-900/20";
        let borderColor = "border-blue-500";
        let textColor = "text-blue-800 dark:text-blue-200";
        let Icon = Info;

        if (text.includes('emergency') || text.includes('immediate')) {
            bgColor = "bg-red-50 dark:bg-red-900/20";
            borderColor = "border-red-500";
            textColor = "text-red-800 dark:text-red-200";
            Icon = AlertTriangle;
        } else if (text.includes('warning') || text.includes('important')) {
            bgColor = "bg-amber-50 dark:bg-amber-900/20";
            borderColor = "border-amber-500";
            textColor = "text-amber-800 dark:text-amber-200";
            Icon = AlertCircle;
        }

        return (
            <blockquote className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-r-lg my-4 flex gap-3 shadow-sm`} {...props}>
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${textColor}`} />
                <div className={`flex-1 ${textColor} font-medium`}>{children}</div>
            </blockquote>
        );
    },

    a: ({ node, ...props }: any) => (
        <a className="text-primary underline hover:opacity-80 font-medium" target="_blank" rel="noopener noreferrer" {...props} />
    ),

    p: ({ node, children, ...props }: any) => (
        <p className="text-muted-foreground leading-relaxed my-3" {...props}>{children}</p>
    ),
};

export default DynamicMarkdownComponents;
