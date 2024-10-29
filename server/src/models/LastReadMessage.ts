import mongoose, { Schema, Document } from 'mongoose';

export interface ILastReadMessage extends Document {
  userId: string;
  channelId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  lastReadAt: Date;
}

const LastReadMessageSchema = new Schema({
  userId: { type: String, required: true },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
  lastReadAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create compound index for efficient lookups
LastReadMessageSchema.index({ userId: 1, channelId: 1 }, { unique: true });

const LastReadMessageModel = mongoose.model<ILastReadMessage>('LastReadMessage', LastReadMessageSchema);
export default LastReadMessageModel;