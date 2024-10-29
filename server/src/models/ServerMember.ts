import mongoose, { Schema, Document } from 'mongoose';

export interface IServerMember extends Document {
  userId: string;
  serverId: mongoose.Types.ObjectId;
  roles: mongoose.Types.ObjectId[];
  nickname?: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ServerMemberSchema = new Schema({
  userId: { type: String, required: true },
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  nickname: { type: String },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure unique user per server
ServerMemberSchema.index({ userId: 1, serverId: 1 }, { unique: true });

export default mongoose.model<IServerMember>('ServerMember', ServerMemberSchema);