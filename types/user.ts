export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  lastSeen: Date;
  status: 'online' | 'offline';
  fcmToken?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  status: 'online' | 'offline';
} 