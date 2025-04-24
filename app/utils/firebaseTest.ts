import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import analytics from '@react-native-firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const testFirebase = async () => {
  try {
    // Initialize Firebase if not already initialized
    let app;
    if (firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }

    // Initialize other Firebase services
    if (app) {
      // Initialize Storage
      const storageInstance = storage();
      await storageInstance.ref().list({ maxResults: 1 });
      console.log('Firebase Storage initialized successfully');

      // Initialize Analytics
      const analyticsInstance = analytics();
      await analyticsInstance.setAnalyticsCollectionEnabled(true);
      console.log('Firebase Analytics initialized successfully');
    }

    console.log('All Firebase services initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
}; 