import mongoose, { Schema, Document } from 'mongoose';

export interface IUnreadMessage extends Document {
  userId: string;
  channelId: mongoose.Types.ObjectId;
  serverId: mongoose.Types.ObjectId;
  lastReadMessageId: mongoose.Types.ObjectId;
  mentionCount: number;
  lastMentionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UnreadMessageSchema = new Schema({
  userId: { type: String, required: true },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  lastReadMessageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
  mentionCount: { type: Number, default: 0 },
  lastMentionId: { type: Schema.Types.ObjectId, ref: 'Message' }
}, { 
  timestamps: true,
  indexes: [
    { userId: 1, channelId: 1 },
    { userId: 1, serverId: 1 }
  ]
});

export default mongoose.model<IUnreadMessage>('UnreadMessage', UnreadMessageSchema);