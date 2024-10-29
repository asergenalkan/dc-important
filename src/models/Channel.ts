import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  type: 'text' | 'voice';
  serverId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'voice'], default: 'text' },
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
}, { timestamps: true });

const ChannelModel = mongoose.model<IChannel>('Channel', ChannelSchema);
export default ChannelModel;