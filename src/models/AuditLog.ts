import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  serverId: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  userId: string;
  action: string;
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema({
  serverId: { type: Schema.Types.ObjectId, ref: 'Server', required: true },
  channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
  userId: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
}, { timestamps: true });

const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLogModel;