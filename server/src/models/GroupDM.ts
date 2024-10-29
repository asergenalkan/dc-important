import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupDM extends Document {
  name?: string;
  icon?: string;
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupDMSchema = new Schema({
  name: { 
    type: String,
    trim: true,
    maxlength: 100
  },
  icon: {
    type: String
  },
  participants: [{
    type: String,
    required: true
  }],
  lastMessage: {
    content: String,
    senderId: String,
    timestamp: Date
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Ensure at least 3 participants
GroupDMSchema.pre('save', function(next) {
  if (this.participants.length < 3) {
    next(new Error('Group DM must have at least 3 participants'));
  } else {
    next();
  }
});

export default mongoose.model<IGroupDM>('GroupDM', GroupDMSchema);