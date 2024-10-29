import { useState } from 'react';
import { X, Monitor, Volume2, FileText } from 'lucide-react';
import { screenQualityPresets, type ScreenQuality } from '../../config/screenShare';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    quality: ScreenQuality;
    audio: boolean;
    optimizeForText: boolean;
  };
  onSettingsChange: (settings: Props['settings']) => void;
}

export default function ScreenShareSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: Props) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Screen Share Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Quality Settings */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Monitor className="w-4 h-4 mr-2" />
                Stream Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(screenQualityPresets) as ScreenQuality[]).map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setLocalSettings(prev => ({ ...prev, quality }))}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      localSettings.quality === quality
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {localSettings.quality === 'low' && '720p, 15 fps, 1.5 Mbps'}
                {localSettings.quality === 'medium' && '1080p, 30 fps, 3 Mbps'}
                {localSettings.quality === 'high' && '1440p, 60 fps, 6 Mbps'}
              </p>
            </div>

            {/* Audio Toggle */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <Volume2 className="w-4 h-4 mr-2" />
                Share Audio
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.audio}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    audio: e.target.checked
                  }))}
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-gray-300">Include system audio</span>
              </label>
            </div>

            {/* Text Optimization */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                Text Optimization
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.optimizeForText}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    optimizeForText: e.target.checked
                  }))}
                  className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-gray-300">Optimize for text readability</span>
              </label>
            </div>

            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}