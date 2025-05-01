// Import polyfills first
import './polyfills';

import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View, Alert } from 'react-native';
import { initializeSupabase } from './config/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Starting app initialization...');
        
        // Initialize Supabase with more detailed error logging
        console.log('Initializing Supabase...');
        try {
          await initializeSupabase();
          console.log('Supabase initialized successfully');
        } catch (supabaseError) {
          console.error('Supabase initialization failed:', supabaseError);
          throw supabaseError;
        }
        
        // Ensure minimum splash screen time
        console.log('Waiting for minimum splash screen time...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('App initialization completed successfully');
        setAppIsReady(true);
      } catch (e) {
        console.error('Critical initialization error:', e);
        setError(e instanceof Error ? e : new Error(String(e)));
        // Important: Set appIsReady even if there's an error to prevent splash screen from being stuck
        setAppIsReady(true);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        console.log('Attempting to hide splash screen...');
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden successfully');
      } catch (e) {
        console.error('Error hiding splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}
