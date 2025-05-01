import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_URL } from '@/config';

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  error: Error | null;
  sendMessage: (data: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(API_URL.replace(/^http/, 'ws'));
    socketRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (e: any) => {
      setError(new Error(e?.message || 'WebSocket error'));
      setIsConnected(false);
    };

    // Optionally handle ws.onmessage here if you want to expose messages

    return () => {
      ws.close();
      setSocket(null);
    };
  }, []);

  const sendMessage = (data: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, error, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
