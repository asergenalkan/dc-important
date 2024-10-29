import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  color: string;
  permissions: string[];
  serverId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#99AAB5' },
  permissions: [{ type: String }],
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  position: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IRole>('Role', RoleSchema);