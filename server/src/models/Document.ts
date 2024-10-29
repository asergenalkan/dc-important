import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  channelId: mongoose.Types.ObjectId;
  createdBy: string;
  lastEditedBy: string;
  parentId?: mongoose.Types.ObjectId;
  order: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema({
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
  channelId: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  lastEditedBy: {
    type: String,
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  order: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Ensure unique order within the same parent
DocumentSchema.index({ channelId: 1, parentId: 1, order: 1 }, { unique: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);