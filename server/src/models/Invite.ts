import mongoose, { Schema, Document } from 'mongoose';

export interface IInvite extends Document {
  code: string;
  serverId: mongoose.Types.ObjectId;
  creatorId: string;
  maxUses?: number;
  uses: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema({
  code: { type: String, required: true, unique: true },
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  creatorId: { type: String, required: true },
  maxUses: { type: Number },
  uses: { type: Number, default: 0 },
  expiresAt: { type: Date },
}, { timestamps: true });

// Create a compound index for efficient lookups
InviteSchema.index({ code: 1, serverId: 1 });

export default mongoose.model<IInvite>('Invite', InviteSchema);