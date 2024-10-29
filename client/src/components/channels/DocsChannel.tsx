import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import api from '../../config/api';
import type { IDocument } from '../../types';

interface Props {
  channelId: string;
}

export default function DocsChannel({ channelId }: Props) {
  const { user } = useUser();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (channelId) {
      fetchDocuments();
    }
  }, [channelId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/docs/channel/${channelId}`);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFolder = (docId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDocTree = (docs: IDocument[], parentId?: string, level = 0) => {
    const filteredDocs = docs.filter(doc => doc.parentId === parentId);
    
    return filteredDocs.map(doc => (
      <div key={doc._id} style={{ marginLeft: `${level * 20}px` }}>
        <button
          onClick={() => setSelectedDoc(doc._id)}
          className={`w-full flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors ${
            selectedDoc === doc._id ? 'bg-gray-700' : ''
          }`}
        >
          {doc.parentId === undefined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(doc._id);
              }}
              className="p-1 hover:bg-gray-600 rounded-lg mr-1"
            >
              {expandedFolders.has(doc._id) ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
          {doc.parentId === undefined ? (
            <Folder className="w-5 h-5 text-gray-400 mr-2" />
          ) : (
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
          )}
          <span className="text-white truncate">{doc.title}</span>
        </button>
        {expandedFolders.has(doc._id) && renderDocTree(docs, doc._id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="flex h-full bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Documents</h2>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            renderDocTree(filteredDocs)
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {selectedDoc ? (
          <div>
            {/* Document editor will be implemented here */}
            <p className="text-gray-400">Document editor coming soon...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              Select a document to view
            </h3>
            <p className="text-gray-400">
              Or create a new one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}