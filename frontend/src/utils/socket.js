import { io } from 'socket.io-client';

// Auto-detect production environment
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Get socket URL from environment variable or auto-detect
let SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

if (!SOCKET_URL) {
  if (isProduction) {
    // Auto-detect Render backend URL (common pattern)
    // You can override this with REACT_APP_SOCKET_URL env variable
    SOCKET_URL = 'https://intervue-poll-0bvl.onrender.com';
    console.warn('⚠️ REACT_APP_SOCKET_URL not set. Using default Render URL:', SOCKET_URL);
    console.warn('   Set REACT_APP_SOCKET_URL in Vercel environment variables for production!');
  } else {
    SOCKET_URL = 'http://localhost:5001';
  }
}

// Log the URL being used (helpful for debugging)
console.log('🔌 Socket URL configured:', SOCKET_URL);
console.log('📍 Environment:', isProduction ? 'Production' : 'Development');

let socket = null;
let isConnecting = false;

export const getSocket = () => {
  // If socket exists and is connected or connecting, return it
  if (socket && (socket.connected || isConnecting)) {
    return socket;
  }

  // If socket exists but disconnected, try to reconnect
  if (socket && !socket.connected) {
    console.log('🔄 Reconnecting existing socket...');
    socket.connect();
    return socket;
  }

  // Create new socket connection
  if (!socket) {
    console.log('🔌 Creating new socket connection to:', SOCKET_URL);
    isConnecting = true;
    
    socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Try polling first, then websocket
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
      // For HTTPS deployments, ensure secure connections
      secure: isProduction, // Use secure connection in production (HTTPS)
      rejectUnauthorized: false // Allow self-signed certificates (for Render)
    });

    // Add connection event listeners for debugging
    socket.on('connect', () => {
      console.log('✅ Socket connected successfully!');
      console.log('   Socket ID:', socket.id);
      console.log('   Transport:', socket.io.engine?.transport?.name || 'unknown');
      isConnecting = false;
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected. Reason:', reason);
      isConnecting = false;
      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need to reconnect manually
        console.log('🔄 Attempting manual reconnect...');
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error!');
      console.error('   Error message:', error.message);
      console.error('   Error type:', error.type);
      console.error('   Error description:', error.description);
      console.error('   Attempting to connect to:', SOCKET_URL);
      console.error('   Full error object:', error);
      isConnecting = false;
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error event:', error);
      isConnecting = false;
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      isConnecting = false;
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
      isConnecting = true;
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
      isConnecting = false;
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after all attempts');
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

