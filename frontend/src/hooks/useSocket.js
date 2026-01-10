import { useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../utils/socket';

export const useSocket = (role, onConnect, onDisconnect) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (onConnect) {
      socket.on('connect', onConnect);
    }

    if (onDisconnect) {
      socket.on('disconnect', onDisconnect);
    }

    return () => {
      if (onConnect) {
        socket.off('connect', onConnect);
      }
      if (onDisconnect) {
        socket.off('disconnect', onDisconnect);
      }
    };
  }, [role, onConnect, onDisconnect]);

  return socketRef.current;
};




