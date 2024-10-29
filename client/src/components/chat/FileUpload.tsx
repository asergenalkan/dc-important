import { useState, useRef } from 'react';
import { File, X, Upload } from 'lucide-react';

interface Props {
  onUpload: (files: File[]) => void;
  maxSize?: number; // in MB
  accept?: string;
}

export default function FileUpload({ onUpload, maxSize = 10, accept = '*/*' }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    validateAndUpload(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndUpload(files);
  };

  const validateAndUpload = (files: File[]) => {
    const validFiles = files.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  return (
    <div 
      className={`relative p-4 border-2 border-dashed rounded-lg transition-colors ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-500/10' 
          : 'border-gray-600 hover:border-gray-500'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center">
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-400 text-center">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-indigo-400 hover:text-indigo-300"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Maximum file size: {maxSize}MB
        </p>
      </div>
    </div>
  );
}