import { useState } from 'react';
import { BarChart2, Wifi, Clock, Zap } from 'lucide-react';
import type { PerformanceMetrics } from '../../config/screenShare';

interface Props {
  metrics: PerformanceMetrics;
  quality: string;
}

export default function ScreenShareStats({ metrics, quality }: Props) {
  const [showStats, setShowStats] = useState(false);

  const getHealthStatus = () => {
    if (
      metrics.latency > 200 || 
      metrics.packetLoss > 5 || 
      metrics.qualityDegradation > 0.5 ||
      metrics.freezeCount > 2
    ) return 'poor';
    
    if (
      metrics.latency > 100 || 
      metrics.packetLoss > 2 ||
      metrics.qualityDegradation > 0.2 ||
      metrics.freezeCount > 0
    ) return 'fair';
    
    return 'good';
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="relative">
      <button
        onClick={() => setShowStats(!showStats)}
        className={`p-2 rounded-lg transition-colors ${
          healthStatus === 'poor' ? 'bg-red-500/10 text-red-500' :
          healthStatus === 'fair' ? 'bg-yellow-500/10 text-yellow-500' :
          'bg-green-500/10 text-green-500'
        }`}
      >
        <BarChart2 className="w-5 h-5" />
      </button>

      {showStats && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Wifi className="w-4 h-4 mr-1" /> Network
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bandwidth</span>
                  <span className="text-white">{metrics.bandwidthUsage.toFixed(1)} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Latency</span>
                  <span className="text-white">{metrics.latency.toFixed(0)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Packet Loss</span>
                  <span className="text-white">{metrics.packetLoss.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jitter</span>
                  <span className="text-white">{metrics.jitter.toFixed(1)} ms</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1" /> Performance
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Frame Rate</span>
                  <span className="text-white">{metrics.frameRate.toFixed(0)} fps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Resolution</span>
                  <span className="text-white">
                    {metrics.resolution.width}x{metrics.resolution.height}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Encode Time</span>
                  <span className="text-white">{metrics.encodeTime.toFixed(1)} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quality</span>
                  <span className="text-white capitalize">{quality}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Health</span>
                <span className={`capitalize font-medium ${
                  healthStatus === 'poor' ? 'text-red-400' :
                  healthStatus === 'fair' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {healthStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}