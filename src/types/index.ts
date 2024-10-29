export interface IServer {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  icon?: string;
  members: string[];
  channels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IChannel {
  _id: string;
  name: string;
  type: 'text' | 'voice';
  serverId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  content: string;
  userId: string;
  channelId: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}