import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

export function useSocket() {
  const { getToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = await getToken();
        
        socketRef.current = io(import.meta.env.VITE_API_URL, {
          auth: {
            token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });

      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}