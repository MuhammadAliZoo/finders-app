import React, { createContext, useContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';
import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';
import { User } from '../types/user';

interface FirebaseContextType {
  app: typeof firebase | null;
  auth: FirebaseAuthTypes.Module | null;
  storage: FirebaseStorageTypes.Module | null;
  isInitialized: boolean;
  error: Error | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultContext: FirebaseContextType = {
  app: null,
  auth: null,
  storage: null,
  isInitialized: false,
  error: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
};

const FirebaseContext = createContext<FirebaseContextType>(defaultContext);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [state, setState] = useState<FirebaseContextType>(defaultContext);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Starting Firebase initialization in context...');
        
        // Check if Firebase is available
        if (!firebase) {
          console.error('Firebase module not found');
          throw new Error('Firebase module not found. Please check your native dependencies.');
        }

        // Initialize Firebase if not already initialized
        let app;
        if (!firebase.apps.length) {
          console.log('No Firebase app found, initializing...');
          const config = {
            apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
          };

          // Validate config
          if (!config.apiKey || !config.projectId || !config.appId) {
            console.error('Missing required Firebase config values:', {
              hasApiKey: !!config.apiKey,
              hasProjectId: !!config.projectId,
              hasAppId: !!config.appId
            });
            throw new Error('Missing required Firebase configuration values');
          }

          console.log('Initializing Firebase with config...');
          app = await firebase.initializeApp(config);
          console.log('Firebase app initialized successfully');
        } else {
          console.log('Using existing Firebase app...');
          app = firebase.app();
        }

        // Initialize Auth and Storage
        console.log('Initializing Firebase Auth...');
        const authInstance = auth();
        console.log('Firebase Auth initialized');
        
        console.log('Initializing Firebase Storage...');
        const storageInstance = storage();
        console.log('Firebase Storage initialized');

        setState({
          app: firebase,
          auth: authInstance,
          storage: storageInstance,
          isInitialized: true,
          error: null,
          user: null,
          loading: true,
          signIn: async () => {},
          signUp: async () => {},
          signOut: async () => {},
        });
        console.log('Firebase context state updated successfully');
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setState((prev: FirebaseContextType) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Unknown Firebase error'),
          isInitialized: true,
        }));
      }
    };

    init();

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setState((prev: FirebaseContextType) => ({
          ...prev,
          user: {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
            lastSeen: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : new Date(),
            status: 'online',
          },
          loading: false,
          error: null,
        }));
      } else {
        setState((prev: FirebaseContextType) => ({
          ...prev,
          user: null,
          loading: false,
          error: null,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  if (!state.isInitialized) {
    return null;
  }

  if (state.error) {
    console.error('Firebase initialization error:', state.error);
  }

  const signIn = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext; 