import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { setupVoiceServer } from './websocket/voiceServer';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Set up WebSocket server for voice chat
setupVoiceServer(httpServer);

app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth());

// Routes
app.use('/api/channels', (await import('./routes/channels')).default);
app.use('/api/messages', (await import('./routes/messages')).default);
app.use('/api/servers', (await import('./routes/servers')).default);
app.use('/api/roles', (await import('./routes/roles')).default);
app.use('/api/direct-messages', (await import('./routes/directMessages')).default);
app.use('/api/voice-settings', (await import('./routes/voiceSettings')).default);
app.use('/api/webhooks', (await import('./webhooks/clerk')).default);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();