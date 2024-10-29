import { Socket as SocketIO } from 'socket.io';

export interface ServerToClientEvents {
  new_message: (message: {
    content: string;
    userId: string;
    channelId: string;
    createdAt: Date;
  }) => void;
  new_direct_message: (message: {
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: Date;
  }) => void;
  user_joined: (data: { userId: string }) => void;
  user_left: (data: { userId: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string) => void;
  leave_room: (roomId: string) => void;
  send_message: (data: {
    content: string;
    channelId: string;
  }) => void;
  send_direct_message: (data: {
    content: string;
    receiverId: string;
  }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
}

export type Socket = SocketIO<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;