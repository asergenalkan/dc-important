import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Pin, Bookmark } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import api from '../../config/api';
import type { INote } from '../../types';
import NoteEditor from './NoteEditor';

interface Props {
  serverId?: string;
  channelId?: string;
}

export default function NotesPanel({ serverId, channelId }: Props) {
  const { user } = useUser();
  const [notes, setNotes] = useState<INote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pinned' | 'bookmarked'>('all');
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [serverId, channelId]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/api/notes', {
        params: { serverId, channelId },
      });
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes
    .filter((note) => {
      if (filter === 'pinned') return note.isPinned;
      if (filter === 'bookmarked') return note.isBookmarked;
      return true;
    })
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

  const handleSaveNote = async (data: Partial<INote>) => {
    try {
      if (selectedNote) {
        // Update existing note
        const response = await api.patch(
          `/api/notes/${selectedNote._id}`,
          data
        );
        setNotes((prev) =>
          prev.map((note) =>
            note._id === selectedNote._id ? response.data : note
          )
        );
      } else {
        // Create new note
        const response = await api.post('/api/notes', {
          ...data,
          serverId,
          channelId,
        });
        setNotes((prev) => [...prev, response.data]);
      }
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to save note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await api.delete(`/api/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Notes</h2>
          <button
            onClick={() => setSelectedNote(null)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex rounded-lg overflow-hidden mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
              filter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
              filter === 'pinned'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Pinned
          </button>
          <button
            onClick={() => setFilter('bookmarked')}
            className={`flex-1 px-3 py-1.5 text-sm transition-colors ${
              filter === 'bookmarked'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Bookmarked
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <button
                key={note._id}
                onClick={() => setSelectedNote(note)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedNote?._id === note._id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800'
                }`}
                style={{ backgroundColor: note.color }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <div className="flex items-center space-x-1">
                    {note.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-600" />
                    )}
                    {note.isBookmarked && (
                      <Bookmark className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {note.content}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-gray-800/50 text-gray-900 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No notes found</div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {selectedNote || selectedNote === null ? (
          <NoteEditor
            note={selectedNote || undefined}
            onSave={handleSaveNote}
            onDelete={
              selectedNote
                ? () => handleDeleteNote(selectedNote._id)
                : undefined
            }
            onClose={() => setSelectedNote(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              Select a note or create a new one
            </h3>
            <p className="text-gray-400">
              Keep your thoughts organized and easily accessible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
