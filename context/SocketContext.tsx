import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (data: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      // You can pass the userId as a query param or in a custom header if your backend supports it
      const wsUrl = (process.env.EXPO_PUBLIC_API_URL || 'ws://localhost:3000')
        .replace(/^http/, 'ws') + `?userId=${currentUser.id}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;
      setSocket(ws);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      return () => {
        ws.close();
        setSocket(null);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [currentUser]);

  const sendMessage = (data: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage }}>{children}</SocketContext.Provider>
  );
};
