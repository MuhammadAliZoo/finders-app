import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { isExpoGo } from '../utils/expoCompatibility';
import { Platform } from 'react-native';
import { RealtimeClientOptions } from '@supabase/supabase-js';
import 'react-native-get-random-values'; // Required for crypto operations

// Configure WebSocket for React Native
const websocketConstructor = Platform.OS === 'web' ? undefined : require('react-native-websocket').default;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

// Configure Supabase client options
const supabaseOptions = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    transport: websocketConstructor,
    params: {
      eventsPerSecond: 10
    }
  }
};

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Add Expo Go specific error handling
if (isExpoGo) {
  // Override storage operations
  const originalStorage = supabase.storage;
  Object.defineProperty(supabase, 'storage', {
    get: () => ({
      ...originalStorage,
      from: (bucketId: string) => {
        const bucket = originalStorage.from(bucketId);
        return {
          ...bucket,
          upload: async (path: string, file: any, options?: any) => {
            try {
              return await bucket.upload(path, file, options);
            } catch (error) {
              console.error('Storage upload error in Expo Go:', error);
              throw new Error(
                'Storage operation failed in Expo Go. Please try again or use a development build.',
              );
            }
          },
          download: async (path: string) => {
            try {
              return await bucket.download(path);
            } catch (error) {
              console.error('Storage download error in Expo Go:', error);
              throw new Error(
                'Storage operation failed in Expo Go. Please try again or use a development build.',
              );
            }
          },
        };
      },
    }),
  });

  // Override auth operations
  const originalAuth = supabase.auth;
  Object.defineProperty(supabase, 'auth', {
    get: () => ({
      ...originalAuth,
      signInWithPassword: async (credentials: any) => {
        try {
          return await originalAuth.signInWithPassword(credentials);
        } catch (error) {
          console.error('Auth sign in error in Expo Go:', error);
          throw new Error(
            'Authentication failed in Expo Go. Please try again or use a development build.',
          );
        }
      },
      signUp: async (credentials: any) => {
        try {
          return await originalAuth.signUp(credentials);
        } catch (error) {
          console.error('Auth sign up error in Expo Go:', error);
          throw new Error(
            'Authentication failed in Expo Go. Please try again or use a development build.',
          );
        }
      },
    }),
  });

  // Override realtime operations
  const originalRealtime = supabase.realtime;
  Object.defineProperty(supabase, 'realtime', {
    get: () => ({
      ...originalRealtime,
      channel: (channelName: string) => {
        const channel = originalRealtime.channel(channelName);
        return {
          ...channel,
          subscribe: async (callback: (payload: any) => void) => {
            try {
              return await channel.subscribe(callback);
            } catch (error) {
              console.error('Realtime subscription error in Expo Go:', error);
              throw new Error(
                'Realtime subscription failed in Expo Go. Please try again or use a development build.',
              );
            }
          },
        };
      },
    }),
  });
}

// Export commonly used modules
export const storage = supabase.storage;
export const auth = supabase.auth;

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Initialize Supabase connection
export const initializeSupabase = async () => {
  if (isExpoGo) {
    console.log('Running in Expo Go - using Expo-specific configuration');
  }

  try {
    console.log('Attempting to connect to Supabase...');
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Failed to establish connection with Supabase');
      throw new Error('Failed to connect to Supabase');
    }
    
    // Test realtime connection with timeout
    console.log('Testing realtime connection...');
    const channel = supabase.channel('connection_test');
    
    // Create a promise that resolves when the connection is established or rejects after timeout
    const connectionPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve(false); // Resolve with false instead of rejecting to continue app initialization
      }, 5000); // 5 second timeout

      channel.subscribe((status) => {
        console.log('Realtime connection status:', status);
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          console.log('Realtime connection established successfully');
          channel.unsubscribe();
          resolve(true);
        }
      });
    });

    const realtimeConnected = await connectionPromise;
    if (!realtimeConnected) {
      console.warn('Realtime connection timed out, but continuing with app initialization');
    }

    console.log('Supabase initialization completed');
  } catch (error) {
    console.error('Supabase initialization error:', error);
    throw error;
  }
};
