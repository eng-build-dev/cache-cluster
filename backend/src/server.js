const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDatabase } = require('./config/database');
const pollRoutes = require('./routes/pollRoutes');
const studentRoutes = require('./routes/studentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const PollSocketHandler = require('./socket/PollSocketHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration - allow specific origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://intervue-poll-j6au.vercel.app', // Vercel frontend
  'https://intervue-poll-0bvl.onrender.com', // Render frontend (if deployed)
  process.env.FRONTEND_URL // From environment variable
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
      // Allow Vercel and Render domains
      if (origin.includes('vercel.app') || origin.includes('onrender.com')) {
        return callback(null, true);
      }
      
      // Allow all origins for now (development and production)
      // The domain checks above handle most cases
      // In strict production, you can add specific origin checks here
      callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      
      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow Vercel and Render domains
      if (origin.includes('vercel.app') || origin.includes('onrender.com')) {
        return callback(null, true);
      }
      
      // For production, still allow Vercel/Render domains (already checked above)
      // Don't block in production - the domain checks above handle it
      // Development fallback
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Add error handling for Socket.io
io.on('connection_error', (error) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ SOCKET.IO CONNECTION ERROR');
  console.error('   Message:', error.message);
  console.error('   Description:', error.description);
  console.error('   Context:', error.context);
  console.error('   Full error:', error);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

io.engine.on('connection_error', (err) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ SOCKET.IO ENGINE CONNECTION ERROR');
  console.error('   Code:', err.code);
  console.error('   Message:', err.message);
  console.error('   Context:', err.context);
  console.error('   Request URL:', err.req?.url);
  console.error('   Type:', err.type);
  if (err.stack) {
    console.error('   Stack:', err.stack);
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Catch any unhandled errors in socket connections
io.engine.on('error', (err) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ SOCKET.IO ENGINE ERROR');
  console.error('   Error:', err);
  console.error('   Message:', err.message);
  if (err.stack) {
    console.error('   Stack:', err.stack);
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Middleware - Apply CORS before routes
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/polls', pollRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize Socket.io handler
console.log('🔧 Initializing Socket.io handler...');
try {
  new PollSocketHandler(io);
  console.log('✅ Socket.io handler initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Socket.io handler:', error);
  console.error('Error stack:', error.stack);
}

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

