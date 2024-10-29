import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  channelId: mongoose.Types.ObjectId;
  columnId: string;
  createdBy: string;
  assignees: string[];
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  labels: string[];
  checklist: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  attachments: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  columnId: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  assignees: [{
    type: String
  }],
  dueDate: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  labels: [{
    type: String,
    trim: true
  }],
  checklist: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  attachments: [{
    type: String
  }],
  position: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure unique positions within the same column
TaskSchema.index({ channelId: 1, columnId: 1, position: 1 }, { unique: true });

export default mongoose.model<ITask>('Task', TaskSchema);