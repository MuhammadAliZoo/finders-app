import React, { useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import { View, Alert, Text } from 'react-native';
import { initializeSupabase } from './config/supabase';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] Starting initialization...');
        
        // Initialize Supabase
        console.log('[App] Initializing Supabase...');
        try {
          const isInitialized = await initializeSupabase();
          if (!isInitialized) {
            throw new Error('Supabase initialization failed');
          }
          console.log('[App] Supabase initialized successfully');
        } catch (supabaseError: any) {
          console.error('[App] Supabase initialization error:', supabaseError);
          throw new Error(`Supabase initialization failed: ${supabaseError.message}`);
        }

        // Ensure minimum splash screen time
        console.log('[App] Waiting for minimum splash screen time...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('[App] App initialization completed successfully');
        setAppIsReady(true);
      } catch (e) {
        console.error('[App] Critical initialization error:', e);
        setError(e instanceof Error ? e : new Error(String(e)));
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        console.log('[App] Attempting to hide splash screen...');
        await SplashScreen.hideAsync();
        console.log('[App] Splash screen hidden successfully');
      } catch (e) {
        console.error('[App] Error hiding splash screen:', e);
      }
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="auto" />
        <Text>Loading...</Text>
        {error && (
          <Text style={{ color: 'red', marginTop: 20, textAlign: 'center', padding: 20 }}>
            [ERROR] {error.message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthProvider>
        <ThemeProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <AppNavigator />
            <StatusBar style="auto" />
          </View>
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
