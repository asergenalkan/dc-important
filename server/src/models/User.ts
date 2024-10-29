import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  imageUrl?: string;
  servers: mongoose.Types.ObjectId[];
  friends: string[];
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  gameActivity?: {
    name: string;
    details?: string;
    startedAt: Date;
  };
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  imageUrl: { type: String },
  servers: [{ type: Schema.Types.ObjectId, ref: 'Server' }],
  friends: [{ type: String }],
  status: { 
    type: String, 
    enum: ['online', 'idle', 'dnd', 'offline'],
    default: 'online'
  },
  customStatus: { type: String },
  gameActivity: {
    name: { type: String },
    details: { type: String },
    startedAt: { type: Date }
  },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

// Update lastSeen on every document save
UserSchema.pre('save', function(next) {
  this.lastSeen = new Date();
  next();
});

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;