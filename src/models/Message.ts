import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  userId: string;
  channelId: mongoose.Types.ObjectId;
  attachments?: string[];
  mentions: string[];
  edited: boolean;
  editedAt?: Date;
  reactions: {
    emoji: string;
    users: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema(
  {
    content: { type: String, required: true },
    userId: { type: String, required: true },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    attachments: [{ type: String }],
    mentions: [{ type: String }],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

// Extract mentions from content
MessageSchema.pre(
  'save',
  function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [
      ...new Set(this.content.match(mentionRegex) || []),
    ] as string[];
    this.mentions = mentions.map((mention) => mention.substring(1));
    next();
  }
);

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
export default MessageModel;