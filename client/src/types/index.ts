export interface IServer {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  icon?: string;
  banner?: string;
  welcomeMessage?: string;
  isPublic?: boolean;
  tags?: string[];
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
  members: string[];
  channels: string[];
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IChannel {
  _id: string;
  name: string;
  type:
    | 'text'
    | 'voice'
    | 'docs'
    | 'calendar'
    | 'polls'
    | 'tasks'
    | 'announcement';
  serverId: string;
  description?: string;
  isNsfw?: boolean;
  slowMode?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  content: string;
  userId: string; // ID of the user who sent the message
  channelId: string; // ID of the channel where the message was sent
  attachments?: string[]; // Array of attachment URLs or IDs
  createdAt: string; // Creation date of the message as a string
  updatedAt: string; // Last updated date of the message as a string
  edited?: boolean; // Indicates if the message has been edited

  reactions?: Array<{
    emoji: string; // Emoji or symbol used for the reaction
    count: number; // Count of reactions for this emoji
    userIds: string[]; // Array of user IDs who reacted with this emoji
  }>;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  imageUrl?: string;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface IActivity {
  _id: string;
  type: 'message' | 'voice' | 'game' | 'friend' | 'server_join';
  userId: string;
  data: {
    serverId?: {
      _id: string;
      name: string;
    };
    channelId?: string;
    messageId?: string;
    friendId?: string;
    game?: {
      name: string;
      details?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ICalendarEvent {
  _id: string;
  title: string;
  description?: string;
  channelId: string;
  createdBy: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  color: string;
  attendees: {
    userId: string;
    status: 'pending' | 'accepted' | 'declined' | 'maybe';
  }[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: string;
  };
  reminders: {
    time: number;
    type: 'notification' | 'email';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IDirectMessage {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRole {
  _id: string;
  name: string;
  color: string;
  permissions: string[];
  serverId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPoll {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft' | 'ended'; // Updated to include "ended"
  createdAt: Date;
  updatedAt: Date;

  options: Array<{
    voterIds: any;
    voterId: string | undefined;
    id: string;
    text: string;
    votes: number;
  }>; // Assuming options is an array

  settings?: {
    visibility?: 'public' | 'private';
    allowMultipleVotes?: boolean;
    showResultsBeforeEnd?: boolean; // New field
    endDate?: string; // New field, use Date type if needed
  };

  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: string;
  };

  reminders?: Array<{ minutes: number }>;
}

export interface IDocument {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[]; // Optional array of tags
  parentId?: string | null; // Optional ID of the parent document, if any
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  assignedTo?: string; // ID of the assigned user
  status: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  parentId?: string | null;

  // Newly added properties based on your error messages
  assignees?: string[]; // Array of user IDs assigned to this task
  columnId?: string; // ID of the column (for task board organization)
  position?: number; // Position within the column, useful for ordering
  labels?: string[]; // Array of labels or tags for categorization
  checklist: Array<{ id: string; text: string; completed: boolean }>;
}

export interface INote {
  _id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  authorId: string;
  color?: string; // Optional color code for note color
  isPinned: boolean;
  isBookmarked: boolean; // Optional flag for bookmarked status
  categoryId?: string;
}
