import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Edit2, Trash2, Smile } from 'lucide-react';
import MessagePreview from './MessagePreview';
import MessageEditor from './MessageEditor';
import MessageActions from './MessageActions';
import MessageReactions from './MessageReactions';
import type { IMessage } from '../../types';

interface Props {
  message: IMessage;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
}

export default function Message({ message, onEdit, onDelete, onReact }: Props) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleEdit = async (content: string) => {
    try {
      await onEdit(message._id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(message._id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleReact = async (emoji: string) => {
    try {
      await onReact(message._id, emoji);
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const canModify = message.userId === user?.id;

  return (
    <div className="group relative flex items-start space-x-3 px-4 py-2 hover:bg-gray-800/50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-medium">
          {message.userId.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline">
          <span className="font-medium text-white mr-2">
            {message.userId === user?.id ? 'You' : 'User'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleString()}
          </span>
          {message.edited && (
            <span className="text-xs text-gray-400 ml-2">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <MessageEditor
            initialContent={message.content}
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <MessagePreview
            content={message.content}
            attachments={message.attachments}
          />
        )}

        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions.map((r) => ({
              emoji: r.emoji,
              users: r.userIds,
            }))}
            userId={user?.id || ''}
            onReact={handleReact}
          />
        )}
      </div>

      <MessageActions
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        onReactionClick={() => setShowReactionPicker(!showReactionPicker)}
        canModify={canModify}
      />
    </div>
  );
}
