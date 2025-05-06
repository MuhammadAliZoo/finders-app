'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  secondary: string;
}

const lightColors: ThemeColors = {
  primary: '#0066FF',
  background: '#FFFFFF',
  card: '#F5F5F5',
  text: '#000000',
  border: '#E5E5E5',
  notification: '#FF3B30',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  secondary: '#8E8E93',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  border: '#38383A',
  notification: '#FF453A',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',
  secondary: '#8E8E93',
};

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  isInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, isInitialized: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
