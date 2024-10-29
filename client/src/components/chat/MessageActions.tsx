import { Edit2, Trash2, Smile } from 'lucide-react';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  onReactionClick: () => void;
  canModify: boolean;
}

export default function MessageActions({ onEdit, onDelete, onReactionClick, canModify }: Props) {
  return (
    <div className="absolute right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-gray-800/90 rounded-lg p-1">
      <button
        onClick={onReactionClick}
        className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Smile className="w-4 h-4 text-gray-400" />
      </button>
      
      {canModify && (
        <>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-400" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
        </>
      )}
    </div>
  );
}