import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Handle WebRTC signaling
    socket.on('offer', ({ targetUserId, offer }) => {
      socket.to(`user:${targetUserId}`).emit('offer', {
        offer,
        fromUserId: userId,
      });
    });

    socket.on('answer', ({ targetUserId, answer }) => {
      socket.to(`user:${targetUserId}`).emit('answer', {
        answer,
        fromUserId: userId,
      });
    });

    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
      socket.to(`user:${targetUserId}`).emit('ice-candidate', {
        candidate,
        fromUserId: userId,
      });
    });

    socket.on('join-voice', ({ channelId }) => {
      socket.join(`voice:${channelId}`);
      socket.to(`voice:${channelId}`).emit('user-joined-voice', { userId });
    });

    socket.on('leave-voice', ({ channelId }) => {
      socket.leave(`voice:${channelId}`);
      socket.to(`voice:${channelId}`).emit('user-left-voice', { userId });
    });

    socket.on('disconnect', () => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
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