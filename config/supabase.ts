import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { isExpoGo } from '../utils/expoCompatibility';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get environment variables from Expo config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('[Supabase Config] Environment check:');
console.log('[Supabase Config] EXPO_PUBLIC_SUPABASE_URL exists:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('[Supabase Config] EXPO_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
console.log('[Supabase Config] Expo Config supabaseUrl exists:', !!Constants.expoConfig?.extra?.supabaseUrl);
console.log('[Supabase Config] Expo Config supabaseAnonKey exists:', !!Constants.expoConfig?.extra?.supabaseAnonKey);
console.log('[Supabase Config] Final supabaseUrl length:', supabaseUrl.length);
console.log('[Supabase Config] Final supabaseAnonKey length:', supabaseAnonKey.length);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your environment variables.');
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
    params: {
      eventsPerSecond: 10
    }
  }
};

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Add Expo Go specific error handling
if (isExpoGo) {
  console.log('Running in Expo Go - using Expo-specific configuration');
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
}

// Export commonly used modules
export const storage = supabase.storage;
export const auth = supabase.auth;

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Initialize Supabase connection
export const initializeSupabase = async () => {
  try {
    console.log('Initializing Supabase...');
    
    // First, try to get the session to verify auth is working
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }
    console.log('Auth session check passed');

    // Then check the database connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase database');
    }
    
    console.log('Supabase initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    throw error;
  }
};
