import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

export function setupVoiceServer(server: Server) {
  const wss = new WebSocketServer({ server });

  const rooms = new Map<string, Set<string>>();

  wss.on('connection', async (ws, req) => {
    // Authenticate user using Clerk
    try {
      const session = await ClerkExpressWithAuth()(req as any, {} as any, () => {});
      const userId = session.auth.userId;

      ws.on('message', (message: string) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'join-room':
            // Add user to room
            if (!rooms.has(data.roomId)) {
              rooms.set(data.roomId, new Set());
            }
            rooms.get(data.roomId)?.add(userId);

            // Notify others in room
            broadcastToRoom(data.roomId, {
              type: 'user-joined',
              userId,
            }, userId);
            break;

          case 'leave-room':
            rooms.get(data.roomId)?.delete(userId);
            if (rooms.get(data.roomId)?.size === 0) {
              rooms.delete(data.roomId);
            }

            // Notify others in room
            broadcastToRoom(data.roomId, {
              type: 'user-left',
              userId,
            }, userId);
            break;

          case 'offer':
          case 'answer':
          case 'ice-candidate':
            // Forward WebRTC signaling messages
            sendToUser(data.targetUserId, {
              type: data.type,
              [data.type]: data.payload,
              userId,
            });
            break;
        }
      });

      ws.on('close', () => {
        // Remove user from all rooms
        rooms.forEach((users, roomId) => {
          if (users.has(userId)) {
            users.delete(userId);
            broadcastToRoom(roomId, {
              type: 'user-left',
              userId,
            }, userId);
          }
        });
      });

    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close();
    }
  });

  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const users = rooms.get(roomId);
    if (!users) return;

    const messageStr = JSON.stringify(message);
    
    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN && (!excludeUserId || client !== excludeUserId)) {
        client.send(messageStr);
      }
    });
  }

  function sendToUser(userId: string, message: any) {
    const messageStr = JSON.stringify(message);
    
    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN && client === userId) {
        client.send(messageStr);
      }
    });
  }
}