import { X, Volume2, Mic, Monitor } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    inputVolume: number;
    outputVolume: number;
    quality: 'low' | 'medium' | 'high';
  };
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  onInputVolumeChange: (volume: number) => void;
  onOutputVolumeChange: (volume: number) => void;
}

export default function VoiceSettings({
  isOpen,
  onClose,
  settings,
  onQualityChange,
  onInputVolumeChange,
  onOutputVolumeChange,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Voice Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Input Volume */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Mic className="w-4 h-4 mr-2" />
                Input Volume
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.inputVolume}
                  onChange={(e) => onInputVolumeChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-400 min-w-[3rem]">
                  {settings.inputVolume}%
                </span>
              </div>
            </div>

            {/* Output Volume */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Volume2 className="w-4 h-4 mr-2" />
                Output Volume
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={settings.outputVolume}
                  onChange={(e) => onOutputVolumeChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-400 min-w-[3rem]">
                  {settings.outputVolume}%
                </span>
              </div>
            </div>

            {/* Quality Settings */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Monitor className="w-4 h-4 mr-2" />
                Voice Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((quality) => (
                  <button
                    key={quality}
                    onClick={() => onQualityChange(quality)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      settings.quality === quality
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}