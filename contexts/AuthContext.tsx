import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseAuthTypes.UserCredential>;
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseAuthTypes.UserCredential>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
        if (userDoc.exists) {
          setUser(userDoc.data() as User);
        } else {
          // Create new user document if it doesn't exist
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            createdAt: new Date(),
            lastSeen: new Date(),
            status: 'online',
          };
          await firestore().collection('users').doc(firebaseUser.uid).set(newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile
      await user.updateProfile({
        displayName: displayName
      });

      // Create user document in Firestore
      const userData: User = {
        id: user.uid,
        email,
        displayName,
        photoURL: null,
        phoneNumber: null,
        createdAt: new Date(),
        lastSeen: new Date(),
        status: 'online',
      };

      await firestore().collection('users').doc(user.uid).set(userData);
      return userCredential;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update Firestore
      await firestore().collection('users').doc(user.id).set(data, { merge: true });
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      // Update Firebase Auth if displayName or photoURL changed
      if (data.displayName || data.photoURL) {
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.updateProfile({
            displayName: data.displayName || undefined,
            photoURL: data.photoURL || undefined,
          });
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 