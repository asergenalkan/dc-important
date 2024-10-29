import { Volume1, Volume2, VolumeX } from 'lucide-react';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function VolumeSlider({ value, onChange }: Props) {
  const getVolumeIcon = () => {
    if (value === 0) return <VolumeX className="w-4 h-4" />;
    if (value <= 100) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onChange(0)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        {getVolumeIcon()}
      </button>
      <input
        type="range"
        min="0"
        max="200"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 ${value/2}%, #374151 ${value/2}%)`,
        }}
      />
      <span className="text-xs text-gray-400 min-w-[2rem]">{value}%</span>
    </div>
  );
}