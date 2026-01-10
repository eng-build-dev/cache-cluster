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

const corsOptions = {
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

io.engine.on('connection_error', (err) => {
  console.error('Socket.io connection error:', err.message);
});

io.engine.on('error', (err) => {
  console.error('Socket.io engine error:', err.message);
});

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/polls', pollRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

try {
  new PollSocketHandler(io);
} catch (error) {
  console.error('Failed to initialize Socket.io handler:', error);
}

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
