import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  error: string;
  warning: string;
  success: string;
}

type Theme = {
  dark: boolean;
  colors: ThemeColors;
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    border: '#C7C7CC',
    notification: '#FF3B30',
    error: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    error: '#FF453A',
    warning: '#FF9F0A',
    success: '#30D158',
  },
};

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  isInitialized: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsDark(colorScheme === 'dark');
    setIsInitialized(true);
  }, [colorScheme]);

  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(!isDark);

  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, isDark, toggleTheme, colors: theme.colors, isInitialized }}
    >
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
