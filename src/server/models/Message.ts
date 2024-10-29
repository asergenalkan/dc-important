import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  userId: string;
  channelId: mongoose.Types.ObjectId;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  content: { type: String, required: true },
  userId: { type: String, required: true },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  attachments: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);