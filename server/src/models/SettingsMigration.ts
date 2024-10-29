import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsMigration extends Document {
  version: number;
  appliedAt: Date;
  description: string;
}

const SettingsMigrationSchema = new Schema({
  version: { type: Number, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
  description: { type: String, required: true },
});

export default mongoose.model<ISettingsMigration>('SettingsMigration', SettingsMigrationSchema);