import mongoose, { Schema, Document } from 'mongoose';

export interface IPoll extends Document {
  title: string;
  description?: string;
  channelId: mongoose.Types.ObjectId;
  createdBy: string;
  options: {
    id: string;
    text: string;
    votes: string[]; // Array of user IDs
  }[];
  settings: {
    allowMultipleVotes: boolean;
    showResultsBeforeEnd: boolean;
    endDate?: Date;
  };
  status: 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema({
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
  createdBy: {
    type: String,
    required: true
  },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    votes: [{ type: String }]
  }],
  settings: {
    allowMultipleVotes: { type: Boolean, default: false },
    showResultsBeforeEnd: { type: Boolean, default: true },
    endDate: Date
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
PollSchema.index({ channelId: 1, status: 1 });

export default mongoose.model<IPoll>('Poll', PollSchema);