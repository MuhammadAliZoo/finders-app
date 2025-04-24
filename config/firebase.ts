import { initializeApp, getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage, FirebaseStorage, ref, getMetadata } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase if it hasn't been initialized yet
let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);

let storage: FirebaseStorage;
try {
  storage = getStorage(app);
} catch (error) {
  console.error('Error initializing Firebase storage:', error);
}

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    // Test Auth
    const currentUser = auth.currentUser;
    console.log('Auth Status:', currentUser ? 'Logged in' : 'Not logged in');

    // Test Firestore
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('Firestore Connection:', testDoc.exists ? 'Successful' : 'No test document');

    // Test Storage
    const storageRef = ref(storage, 'test/connection.txt');
    try {
      await getMetadata(storageRef);
      console.log('Storage Connection: Successful');
    } catch (error) {
      console.log('Storage Connection: No test file (this is normal)');
    }

    return {
      auth: !!currentUser,
      firestore: true,
      storage: true
    };
  } catch (error: any) {
    console.error('Firebase Connection Test Failed:', error);
    return {
      auth: false,
      firestore: false,
      storage: false,
      error: error.message
    };
  }
};

export default app; 