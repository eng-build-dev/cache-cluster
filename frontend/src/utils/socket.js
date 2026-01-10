import { io } from 'socket.io-client';

const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

let SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

if (SOCKET_URL) {
  // Use .env value if provided (works in both dev and production)
} else if (isProduction) {
  SOCKET_URL = 'https://intervue-poll-0bvl.onrender.com';
} else {
  SOCKET_URL = 'http://localhost:5001';
}

let socket = null;
let isConnecting = false;

export const getSocket = () => {
  if (socket && (socket.connected || isConnecting)) {
    return socket;
  }

  if (socket && !socket.connected) {
    socket.connect();
    return socket;
  }

  if (!socket) {
    isConnecting = true;
    
    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      withCredentials: true,
      autoConnect: true,
      upgrade: true,
      rememberUpgrade: false,
      secure: isProduction,
      rejectUnauthorized: false
    });

    socket.on('connect', () => {
      isConnecting = false;
    });

    socket.on('disconnect', (reason) => {
      isConnecting = false;
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      isConnecting = false;
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      isConnecting = false;
    });

    socket.on('reconnect', () => {
      isConnecting = false;
    });

    socket.on('reconnect_attempt', () => {
      isConnecting = true;
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error.message);
      isConnecting = false;
    });

    socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      isConnecting = false;
    });
  }
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

