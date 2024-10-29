import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  userId: string;
  serverId?: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  color: string;
  pinned: boolean;
  tags: string[];
  bookmarked: boolean;
  bookmarkedBy: string[];
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  serverId: {
    type: Schema.Types.ObjectId,
    ref: 'Server'
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel'
  },
  color: {
    type: String,
    default: '#ffffff'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  bookmarked: {
    type: Boolean,
    default: false
  },
  bookmarkedBy: [{
    type: String
  }],
  sharedWith: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
NoteSchema.index({ userId: 1, pinned: 1 });
NoteSchema.index({ serverId: 1, channelId: 1 });
NoteSchema.index({ tags: 1 });

export default mongoose.model<INote>('Note', NoteSchema);