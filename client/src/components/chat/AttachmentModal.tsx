import { useState } from 'react';
import { X } from 'lucide-react';
import FileUpload from './FileUpload';
import FilePreview from './FilePreview';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

export default function AttachmentModal({ isOpen, onClose, onUpload }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleUpload = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Upload Files</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <FileUpload onUpload={handleUpload} />

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">
                Selected Files
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}