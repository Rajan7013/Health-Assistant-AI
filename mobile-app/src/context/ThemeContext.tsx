import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Colors, ThemeColors } from '../constants/Colors';
import { SettingsStorage } from '../utils/settingsStorage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('light');

    // Load theme on mount
    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        const isDark = await SettingsStorage.getDarkMode();
        setThemeState(isDark ? 'dark' : 'light');
    };

    const setTheme = async (newTheme: ThemeMode) => {
        setThemeState(newTheme);
        await SettingsStorage.setDarkMode(newTheme === 'dark');
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        await setTheme(newTheme);
    };

    const colors = theme === 'light' ? Colors.light : Colors.dark;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
