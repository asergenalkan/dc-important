import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  userId: string;
  type: 'message' | 'voice' | 'reaction' | 'friend' | 'server_join' | 'game';
  data: {
    serverId?: string;
    channelId?: string;
    messageId?: string;
    friendId?: string;
    game?: {
      name: string;
      details?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['message', 'voice', 'reaction', 'friend', 'server_join', 'game'],
    required: true
  },
  data: {
    serverId: { type: Schema.Types.ObjectId, ref: 'Server' },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel' },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    friendId: String,
    game: {
      name: String,
      details: String
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ 'data.serverId': 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);