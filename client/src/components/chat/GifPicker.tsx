import { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { Search, X } from 'lucide-react';

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY);

export default function GifPicker({ onSelect, onClose }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGifs = (offset: number) => 
    searchQuery
      ? gf.search(searchQuery, { offset, limit: 10 })
      : gf.trending({ offset, limit: 10 });

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg w-[340px] p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full pl-8 pr-4 py-1.5 bg-gray-700 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[300px] overflow-y-auto">
        <Grid
          onGifClick={(gif) => onSelect(gif.images.original.url)}
          fetchGifs={fetchGifs}
          width={320}
          columns={2}
          gutter={6}
        />
      </div>
    </div>
  );
}