import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from './utils/auth';
import env from './config/env';

let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const userId = await verifyToken(token);
      if (!userId) {
        return next(new Error('Invalid token'));
      }

      socket.data.userId = userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);

    // Join user's personal room
    socket.join(`user:${socket.data.userId}`);

    // Handle voice chat
    socket.on('join_voice', ({ channelId }) => {
      socket.join(`voice:${channelId}`);
      io.to(`voice:${channelId}`).emit('user_joined_voice', {
        userId: socket.data.userId
      });
    });

    socket.on('leave_voice', ({ channelId }) => {
      socket.leave(`voice:${channelId}`);
      io.to(`voice:${channelId}`).emit('user_left_voice', {
        userId: socket.data.userId
      });
    });

    // Handle WebRTC signaling
    socket.on('offer', ({ targetUserId, offer }) => {
      socket.to(`user:${targetUserId}`).emit('offer', {
        offer,
        fromUserId: socket.data.userId
      });
    });

    socket.on('answer', ({ targetUserId, answer }) => {
      socket.to(`user:${targetUserId}`).emit('answer', {
        answer,
        fromUserId: socket.data.userId
      });
    });

    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
      socket.to(`user:${targetUserId}`).emit('ice-candidate', {
        candidate,
        fromUserId: socket.data.userId
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.data.userId);
      socket.leaveAll();
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};