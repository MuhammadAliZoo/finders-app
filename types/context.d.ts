declare module '@/context/AuthContext' {
  import { ReactNode } from 'react';

  interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }

  interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
  }

  export const useAuth: () => AuthContextType;
  export const AuthProvider: React.FC<{ children: ReactNode }>;
}

declare module '@/context/SocketContext' {
  import { Socket } from 'socket.io-client';
  import { ReactNode } from 'react';

  interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    error: Error | null;
  }

  export const useSocket: () => SocketContextType;
  export const SocketProvider: React.FC<{ children: ReactNode }>;
} 