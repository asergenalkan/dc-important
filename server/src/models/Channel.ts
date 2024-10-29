import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  name: string;
  type: 'text' | 'voice' | 'docs' | 'calendar' | 'polls' | 'tasks' | 'forum';
  serverId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  description?: string;
  isNsfw: boolean;
  slowMode: number;
  permissions: {
    roles: {
      roleId: mongoose.Types.ObjectId;
      allow: string[];
      deny: string[];
    }[];
    users: {
      userId: string;
      allow: string[];
      deny: string[];
    }[];
  };
  metadata: {
    // Docs/Wiki specific
    lastEditedBy?: string;
    lastEditedAt?: Date;
    // Calendar specific
    defaultView?: 'month' | 'week' | 'agenda';
    // Tasks specific
    defaultLayout?: 'list' | 'board';
    columns?: {
      id: string;
      name: string;
      color: string;
    }[];
    // Forum specific
    categories?: {
      id: string;
      name: string;
      color: string;
    }[];
    // Polls specific
    allowMultipleVotes?: boolean;
    showResultsBeforeEnd?: boolean;
  };
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  type: { 
    type: String, 
    enum: ['text', 'voice', 'docs', 'calendar', 'polls', 'tasks', 'forum'],
    default: 'text' 
  },
  serverId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Server', 
    required: true 
  },
  categoryId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ChannelCategory' 
  },
  description: { 
    type: String,
    maxlength: 1024
  },
  isNsfw: { 
    type: Boolean, 
    default: false 
  },
  slowMode: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 21600 // 6 hours
  },
  permissions: {
    roles: [{
      roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
      allow: [{ type: String }],
      deny: [{ type: String }]
    }],
    users: [{
      userId: { type: String },
      allow: [{ type: String }],
      deny: [{ type: String }]
    }]
  },
  metadata: {
    lastEditedBy: { type: String },
    lastEditedAt: { type: Date },
    defaultView: { 
      type: String,
      enum: ['month', 'week', 'agenda'],
      default: 'month'
    },
    defaultLayout: {
      type: String,
      enum: ['list', 'board'],
      default: 'list'
    },
    columns: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, required: true }
    }],
    categories: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, required: true }
    }],
    allowMultipleVotes: { type: Boolean, default: false },
    showResultsBeforeEnd: { type: Boolean, default: true }
  },
  position: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure unique positions within a category
ChannelSchema.index({ serverId: 1, categoryId: 1, position: 1 }, { unique: true });

// Add virtual for content count
ChannelSchema.virtual('contentCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'channelId',
  count: true
});

const ChannelModel = mongoose.model<IChannel>('Channel', ChannelSchema);
export default ChannelModel;