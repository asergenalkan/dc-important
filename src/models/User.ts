import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  imageUrl?: string;
  servers: mongoose.Types.ObjectId[];
  friends: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  imageUrl: { type: String },
  servers: [{ type: Schema.Types.ObjectId, ref: 'Server' }],
  friends: [{ type: String }], // Clerk IDs of friends
}, { timestamps: true });

const UserModel = mongoose.model<IUser>('User', UserSchema);
export default UserModel;