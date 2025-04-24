import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let newSocket: Socket | null = null;

    try {
      newSocket = io(API_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        setError(err);
        setIsConnected(false);
      });

      setSocket(newSocket);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize socket connection'));
    }

    return () => {
      if (newSocket) {
        newSocket.removeAllListeners();
        newSocket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}; 