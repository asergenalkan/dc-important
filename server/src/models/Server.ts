import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document {
  name: string;
  description?: string;
  ownerId: string;
  icon?: string;
  banner?: string;
  welcomeMessage?: string;
  customEmojis?: {
    id: string;
    name: string;
    url: string;
    createdBy: string;
  }[];
  members: string[];
  channels: mongoose.Types.ObjectId[];
  isPublic: boolean;
  tags: string[];
  features: {
    customEmojis: boolean;
    welcomeMessage: boolean;
    banners: boolean;
  };
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: { 
    type: String,
    maxlength: 1024
  },
  ownerId: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String 
  },
  banner: {
    type: String
  },
  welcomeMessage: {
    type: String,
    maxlength: 2000
  },
  customEmojis: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    createdBy: { type: String, required: true }
  }],
  members: [{ 
    type: String 
  }],
  channels: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Channel' 
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  features: {
    customEmojis: { type: Boolean, default: false },
    welcomeMessage: { type: Boolean, default: false },
    banners: { type: Boolean, default: false }
  },
  theme: {
    primaryColor: { type: String, default: '#7289DA' },
    accentColor: { type: String, default: '#5865F2' }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
ServerSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

const ServerModel = mongoose.model<IServer>('Server', ServerSchema);
export default ServerModel;