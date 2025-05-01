import { User as FirebaseAuthUser } from 'firebase/auth';

export interface FirebaseUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: 'user' | 'admin';
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastSeen?: Date | string;
  status?: 'online' | 'offline';
  token?: string;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  full_name?: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  username?: string;
  role?: 'user' | 'admin';
  status: 'online' | 'offline';
}
