import mongoose, { Schema, Document } from 'mongoose';

export interface IChannelCategory extends Document {
  name: string;
  serverId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelCategorySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  serverId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Server', 
    required: true 
  },
  position: { 
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Ensure unique positions within a server
ChannelCategorySchema.index({ serverId: 1, position: 1 }, { unique: true });

export default mongoose.model<IChannelCategory>('ChannelCategory', ChannelCategorySchema);