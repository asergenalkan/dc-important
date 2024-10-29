import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: 'text' | 'voice' }) => void;
}

export default function CreateChannelModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type });
    setName('');
    setType('text');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create Channel</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Channel Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="text"
                  checked={type === 'text'}
                  onChange={(e) => setType(e.target.value as 'text' | 'voice')}
                  className="text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-white">Text Channel</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="voice"
                  checked={type === 'voice'}
                  onChange={(e) => setType(e.target.value as 'text' | 'voice')}
                  className="text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-white">Voice Channel</span>
              </label>
            </div>
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
  );
}