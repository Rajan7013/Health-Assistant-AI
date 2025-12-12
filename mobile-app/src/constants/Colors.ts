// Theme color definitions
export const Colors = {
    light: {
        // Primary
        primary: '#0d9488',      // Teal-600
        primaryLight: '#5eead4', // Teal-300
        primaryDark: '#0f766e',  // Teal-700

        // Background
        background: '#ffffff',
        backgroundSecondary: '#f8fafc', // Slate-50
        card: '#ffffff',

        // Text
        text: '#0f172a',        // Slate-900
        textSecondary: '#64748b', // Slate-500
        textMuted: '#94a3b8',   // Slate-400

        // UI Elements
        border: '#e2e8f0',      // Slate-200
        inputBg: '#f1f5f9',     // Slate-100
        shadow: 'rgba(0, 0, 0, 0.1)',

        // Status
        success: '#10b981',     // Green
        warning: '#f59e0b',     // Amber
        error: '#ef4444',       // Red
        info: '#3b82f6',        // Blue

        // Accents
        purple: '#8b5cf6',
        blue: '#3b82f6',
        pink: '#ec4899',
    },

    dark: {
        // Primary
        primary: '#14b8a6',      // Teal-500
        primaryLight: '#2dd4bf', // Teal-400
        primaryDark: '#0d9488',  // Teal-600

        // Background
        background: '#0f172a',   // Slate-900
        backgroundSecondary: '#1e293b', // Slate-800
        card: '#1e293b',         // Slate-800

        // Text
        text: '#f1f5f9',         // Slate-100
        textSecondary: '#cbd5e1', // Slate-300
        textMuted: '#94a3b8',    // Slate-400

        // UI Elements
        border: '#334155',       // Slate-700
        inputBg: '#334155',      // Slate-700
        shadow: 'rgba(0, 0, 0, 0.5)',

        // Status
        success: '#22c55e',      // Green-500
        warning: '#fbbf24',      // Amber-400
        error: '#f87171',        // Red-400
        info: '#60a5fa',         // Blue-400

        // Accents
        purple: '#a78bfa',       // Purple-400
        blue: '#60a5fa',         // Blue-400
        pink: '#f472b6',         // Pink-400
    }
};

export type ThemeColors = typeof Colors.light;
