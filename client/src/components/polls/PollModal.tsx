import { useState } from 'react';
import { X, Plus, Calendar, Users, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import type { IPoll } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<IPoll>) => Promise<void>;
  poll?: IPoll;
}

export default function PollModal({ isOpen, onClose, onSubmit, poll }: Props) {
  const { user } = useUser();
  const [title, setTitle] = useState(poll?.title || '');
  const [description, setDescription] = useState(poll?.description || '');
  const [options, setOptions] = useState(poll?.options || []);
  const [newOption, setNewOption] = useState('');
  const [settings, setSettings] = useState({
    allowMultipleVotes: poll?.settings?.allowMultipleVotes ?? false,
    showResultsBeforeEnd: poll?.settings?.showResultsBeforeEnd ?? true,
    endDate: poll?.settings?.endDate?.split('T')[0] ?? '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (options.length < 2) {
      setError('At least two options are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        options: options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          votes: opt.votes || 0,
          voterIds: opt.voterIds || [],
          voterId: user?.id,
        })),
        settings: {
          allowMultipleVotes: settings.allowMultipleVotes,
          showResultsBeforeEnd: settings.showResultsBeforeEnd,
          endDate: settings.endDate
            ? new Date(settings.endDate).toISOString()
            : undefined,
        },
      });

      onClose();
    } catch (error) {
      setError('Failed to save poll');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          text: newOption.trim(),
          votes: 0,
          voterIds: [],
          voterId: user?.id,
        },
      ]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {poll ? 'Edit Poll' : 'Create Poll'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What would you like to ask?"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context to your question..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <span className="text-gray-400 w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].text = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 w-6">
                    {options.length + 1}.
                  </span>
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                    placeholder="Add option"
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date (optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={settings.endDate}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.allowMultipleVotes}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      allowMultipleVotes: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-gray-300">Allow multiple votes</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showResultsBeforeEnd}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      showResultsBeforeEnd: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-gray-300">
                  Show results before poll ends
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : poll ? 'Update Poll' : 'Create Poll'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
