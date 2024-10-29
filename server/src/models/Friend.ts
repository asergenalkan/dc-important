import mongoose, { Schema, Document } from 'mongoose';

export interface IFriend extends Document {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const FriendSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  friendId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure unique friend relationships
FriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export default mongoose.model<IFriend>('Friend', FriendSchema);