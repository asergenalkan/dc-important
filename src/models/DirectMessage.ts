import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectMessage extends Document {
  content: string;
  senderId: string;
  receiverId: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DirectMessageSchema = new Schema({
  content: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  attachments: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IDirectMessage>('DirectMessage', DirectMessageSchema);