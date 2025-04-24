import firebase from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: any;
let firebaseAuth: FirebaseAuthTypes.Module;
let firebaseStorage: FirebaseStorageTypes.Module;

const initializeFirebase = async () => {
  try {
    console.log('Starting Firebase initialization...');
    console.log('Firebase config:', firebaseConfig);

    if (!firebase.apps.length) {
      console.log('No existing Firebase app found, initializing new app...');
      app = await firebase.initializeApp(firebaseConfig);
    } else {
      console.log('Using existing Firebase app...');
      app = firebase.app();
    }

    console.log('Initializing Firebase Auth...');
    firebaseAuth = auth();
    
    console.log('Initializing Firebase Storage...');
    firebaseStorage = storage();

    console.log('Firebase initialization completed successfully');
    return { app, auth: firebaseAuth, storage: firebaseStorage };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw new Error('Failed to initialize Firebase: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

// Export types for use in other files
export type FirebaseApp = typeof firebase;
export type FirebaseAuth = FirebaseAuthTypes.Module;
export type FirebaseStorage = FirebaseStorageTypes.Module;

// Utility functions
export const getFirebaseApp = () => {
  if (!firebase.apps.length) {
    throw new Error('Firebase not initialized');
  }
  return firebase.app();
};

export const getAuth = () => {
  if (!firebase.apps.length) {
    throw new Error('Firebase not initialized');
  }
  return auth();
};

export const getStorage = () => {
  if (!firebase.apps.length) {
    throw new Error('Firebase not initialized');
  }
  return storage();
};

export { initializeFirebase, app, firebaseAuth, firebaseStorage }; 