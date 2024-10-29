import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  channelId: mongoose.Types.ObjectId;
  createdBy: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  color: string;
  attendees: {
    userId: string;
    status: 'pending' | 'accepted' | 'declined' | 'maybe';
  }[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    until?: Date;
  };
  reminders: {
    time: number; // minutes before event
    type: 'notification' | 'email';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true,
    maxlength: 500
  },
  color: {
    type: String,
    default: '#7289DA'
  },
  attendees: [{
    userId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'maybe'],
      default: 'pending'
    }
  }],
  recurring: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    until: Date
  },
  reminders: [{
    time: { type: Number, required: true }, // minutes before event
    type: {
      type: String,
      enum: ['notification', 'email'],
      default: 'notification'
    }
  }]
}, {
  timestamps: true
});

// Index for efficient date-based queries
CalendarEventSchema.index({ channelId: 1, startDate: 1, endDate: 1 });

export default mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);