import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../config/supabase';

// Check if running in Expo Go
export const isExpoGo = Platform.OS !== 'web' && !Constants.appOwnership;

// Handle common Expo Go compatibility issues
export const handleExpoGoCompatibility = async () => {
  if (!isExpoGo) return;

  try {
    // Check if we can access Supabase
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;

    // Additional Expo Go specific checks can be added here
    console.log('Expo Go compatibility check passed');
  } catch (error) {
    console.error('Expo Go compatibility error:', error);
    throw error;
  }
};

// Handle storage operations in Expo Go
export const handleStorageOperation = async (operation: () => Promise<any>) => {
  if (!isExpoGo) {
    return operation();
  }

  try {
    // Add any Expo Go specific storage handling here
    return await operation();
  } catch (error) {
    console.error('Storage operation error in Expo Go:', error);
    throw error;
  }
};

// Handle auth operations in Expo Go
export const handleAuthOperation = async (operation: () => Promise<any>) => {
  if (!isExpoGo) {
    return operation();
  }

  try {
    // Add any Expo Go specific auth handling here
    return await operation();
  } catch (error) {
    console.error('Auth operation error in Expo Go:', error);
    throw error;
  }
};

// Handle real-time subscriptions in Expo Go
export const handleRealtimeSubscription = (subscription: any) => {
  if (!isExpoGo) {
    return subscription;
  }

  // Add any Expo Go specific real-time handling here
  return subscription;
};

// Check for required permissions in Expo Go
export const checkExpoGoPermissions = async () => {
  if (!isExpoGo) return true;

  try {
    // Add permission checks here
    return true;
  } catch (error) {
    console.error('Permission check error in Expo Go:', error);
    return false;
  }
};

// Handle network connectivity in Expo Go
export const checkNetworkConnectivity = async () => {
  if (!isExpoGo) return true;

  try {
    // Add network connectivity check here
    return true;
  } catch (error) {
    console.error('Network connectivity check error in Expo Go:', error);
    return false;
  }
};

// Handle background tasks in Expo Go
export const handleBackgroundTask = async (task: () => Promise<any>) => {
  if (!isExpoGo) {
    return task();
  }

  try {
    // Add background task handling for Expo Go here
    return await task();
  } catch (error) {
    console.error('Background task error in Expo Go:', error);
    throw error;
  }
};
