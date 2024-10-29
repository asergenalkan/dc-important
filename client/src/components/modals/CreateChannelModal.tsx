import { useState } from 'react';
import {
  X,
  Hash,
  Volume2,
  FileText,
  Calendar,
  ListTodo,
  BarChart2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: 'text' | 'voice' | 'docs' | 'calendar' | 'tasks' | 'polls';
    metadata?: any;
  }) => void;
}

export default function CreateChannelModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<
    'text' | 'voice' | 'docs' | 'calendar' | 'tasks' | 'polls'
  >('text');
  const [error, setError] = useState<string | null>(null);

  const channelTypes = [
    {
      id: 'text',
      label: 'Text Channel',
      icon: Hash,
      description: 'Send messages, images, GIFs, and more',
    },
    {
      id: 'voice',
      label: 'Voice Channel',
      icon: Volume2,
      description: 'Voice chat and video calls',
    },
    {
      id: 'docs',
      label: 'Docs Channel',
      icon: FileText,
      description: 'Create and organize documentation',
    },
    {
      id: 'calendar',
      label: 'Calendar Channel',
      icon: Calendar,
      description: 'Schedule and manage events',
    },
    {
      id: 'tasks',
      label: 'Tasks Channel',
      icon: ListTodo,
      description: 'Track tasks and manage projects',
    },
    {
      id: 'polls',
      label: 'Polls Channel',
      icon: BarChart2,
      description: 'Create polls and gather feedback',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Channel name is required');
      return;
    }

    let metadata = {};
    switch (type) {
      case 'tasks':
        metadata = {
          defaultLayout: 'board',
          columns: [
            { id: 'todo', name: 'To Do', color: '#ff5f5f' },
            { id: 'in_progress', name: 'In Progress', color: '#ffb01f' },
            { id: 'review', name: 'Review', color: '#00b8d9' },
            { id: 'done', name: 'Done', color: '#36b37e' },
          ],
        };
        break;
      case 'calendar':
        metadata = { defaultView: 'month' };
        break;
      case 'polls':
        metadata = { allowMultipleVotes: false, showResultsBeforeEnd: true };
        break;
    }

    onSubmit({ name: name.trim(), type, metadata });
    setName('');
    setType('text');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Channel</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {channelTypes.map((channelType) => (
                  <button
                    key={channelType.id}
                    type="button"
                    onClick={() =>
                      setType(
                        channelType.id as
                          | 'text'
                          | 'voice'
                          | 'docs'
                          | 'calendar'
                          | 'tasks'
                          | 'polls'
                      )
                    }
                    className={`p-3 rounded-lg border-2 transition-colors text-left ${
                      type === channelType.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <channelType.icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-white font-medium">
                          {channelType.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {channelType.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter channel name"
                maxLength={100}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Create Channel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
