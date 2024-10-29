import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function AppearanceSettings() {
  const { theme, updateTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => updateTheme('light')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              theme === 'light'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Sun className="w-6 h-6 text-gray-400 mb-2 mx-auto" />
            <div className="text-white font-medium">Light</div>
          </button>

          <button
            onClick={() => updateTheme('dark')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Moon className="w-6 h-6 text-gray-400 mb-2 mx-auto" />
            <div className="text-white font-medium">Dark</div>
          </button>

          <button
            onClick={() => updateTheme('system')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              theme === 'system'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Monitor className="w-6 h-6 text-gray-400 mb-2 mx-auto" />
            <div className="text-white font-medium">System</div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Font Size</h3>
        <input
          type="range"
          min="12"
          max="20"
          step="1"
          defaultValue="14"
          className="w-full"
          onChange={(e) => {
            document.documentElement.style.fontSize = `${e.target.value}px`;
          }}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Message Display</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2 text-gray-300">Show inline media</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2 text-gray-300">Show link previews</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2 text-gray-300">Show emoji reactions</span>
          </label>
        </div>
      </div>
    </div>
  );
}