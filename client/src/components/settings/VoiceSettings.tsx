import { useState } from 'react';
import { Volume2, Mic, Headphones } from 'lucide-react';

interface Props {
  settings: {
    inputDevice: string;
    outputDevice: string;
    inputVolume: number;
    outputVolume: number;
    automaticGainControl: boolean;
    echoCancellation: boolean;
    noiseSuppression: boolean;
  };
  onSettingsChange: (settings: Props['settings']) => void;
}

export default function VoiceSettings({ settings, onSettingsChange }: Props) {
  const [devices, setDevices] = useState<{
    inputs: MediaDeviceInfo[];
    outputs: MediaDeviceInfo[];
  }>({ inputs: [], outputs: [] });

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices({
        inputs: devices.filter(device => device.kind === 'audioinput'),
        outputs: devices.filter(device => device.kind === 'audiooutput')
      });
    } catch (error) {
      console.error('Failed to load audio devices:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Input Device</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Mic className="w-5 h-5 text-gray-400" />
            <select
              value={settings.inputDevice}
              onChange={(e) => onSettingsChange({
                ...settings,
                inputDevice: e.target.value
              })}
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {devices.inputs.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={settings.inputVolume}
              onChange={(e) => onSettingsChange({
                ...settings,
                inputVolume: Number(e.target.value)
              })}
              className="flex-1"
            />
            <span className="text-white w-12 text-right">{settings.inputVolume}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Output Device</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Headphones className="w-5 h-5 text-gray-400" />
            <select
              value={settings.outputDevice}
              onChange={(e) => onSettingsChange({
                ...settings,
                outputDevice: e.target.value
              })}
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {devices.outputs.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={settings.outputVolume}
              onChange={(e) => onSettingsChange({
                ...settings,
                outputVolume: Number(e.target.value)
              })}
              className="flex-1"
            />
            <span className="text-white w-12 text-right">{settings.outputVolume}%</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Advanced Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.automaticGainControl}
              onChange={(e) => onSettingsChange({
                ...settings,
                automaticGainControl: e.target.checked
              })}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-gray-300">Automatic Gain Control</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.echoCancellation}
              onChange={(e) => onSettingsChange({
                ...settings,
                echoCancellation: e.target.checked
              })}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-gray-300">Echo Cancellation</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.noiseSuppression}
              onChange={(e) => onSettingsChange({
                ...settings,
                noiseSuppression: e.target.checked
              })}
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-gray-300">Noise Suppression</span>
          </label>
        </div>
      </div>
    </div>
  );
}