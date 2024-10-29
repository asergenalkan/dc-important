import { X, File as FileIcon, Image } from 'lucide-react';

interface Props {
  file: File;
  onRemove: () => void;
}

export default function FilePreview({ file, onRemove }: Props) {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="relative group">
      {isImage ? (
        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-700">
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-lg bg-gray-700 flex flex-col items-center justify-center p-4">
          <FileIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-xs text-gray-400 text-center truncate w-full">
            {file.name}
          </span>
        </div>
      )}

      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}