'use client';

import React from 'react';
import { createContext, useState, useContext, type ReactNode } from 'react';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    primary: string;
    success: string;
    error: string;
    warning: string;
    secondary: string;
  };
}

const defaultColors = {
  dark: {
    background: '#121212',
    card: '#262626',
    text: '#FFFFFF',
    border: '#333333',
    primary: '#00BFFF',
    success: '#32CD32',
    error: '#FF4500',
    warning: '#FFD700',
    secondary: '#87CEEB',
  },
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#121212',
    border: '#E0E0E0',
    primary: '#0088CC',
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
    secondary: '#6C757D',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const colors = defaultColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
