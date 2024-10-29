import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document {
  name: string;
  description?: string;
  ownerId: string;
  icon?: string;
  members: string[];
  channels: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  icon: { type: String },
  members: [{ type: String }],
  channels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
}, { timestamps: true });

const ServerModel = mongoose.model<IServer>('Server', ServerSchema);
export default ServerModel;