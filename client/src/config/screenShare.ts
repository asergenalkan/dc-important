// client/src/config/screenShare.ts
export const screenQualityPresets = {
  low: {
    width: 1280,
    height: 720,
    frameRate: 15,
  } as MediaTrackConstraints,
  medium: {
    width: 1920,
    height: 1080,
    frameRate: 30,
  } as MediaTrackConstraints,
  high: {
    width: 2560,
    height: 1440,
    frameRate: 60,
  } as MediaTrackConstraints,
  text: {
    width: 1920,
    height: 1080,
    frameRate: 15,
    contentHint: 'text',
  } as MediaTrackConstraints,
  gaming: {
    width: 1920,
    height: 1080,
    frameRate: 60,
    contentHint: 'motion',
  } as MediaTrackConstraints,
  presentation: {
    width: 1920,
    height: 1080,
    frameRate: 24,
    contentHint: 'detail',
  } as MediaTrackConstraints,
} as const;

export type ScreenQuality = keyof typeof screenQualityPresets;

export interface AutoAdjustSettings {
  enabled: boolean;
  minQuality: ScreenQuality;
  maxQuality: ScreenQuality;
  targetLatency: number;
  targetBandwidth: number;
  adjustmentInterval: number;
  aggressiveness: 'low' | 'medium' | 'high';
}

export const defaultAutoAdjustSettings: AutoAdjustSettings = {
  enabled: true,
  minQuality: 'low',
  maxQuality: 'high',
  targetLatency: 100, // ms
  targetBandwidth: 3, // Mbps
  adjustmentInterval: 5000, // ms
  aggressiveness: 'medium',
};

export interface PerformanceMetrics {
  bandwidthUsage: number;
  latency: number;
  packetLoss: number;
  frameRate: number;
  encodeTime: number;
  resolution: {
    width: number;
    height: number;
  };
  qualityDegradation: number;
  freezeCount: number;
  jitter: number;
}

export const defaultScreenShareSettings = {
  quality: 'medium' as ScreenQuality,
  audio: true,
  optimizeForText: false,
  autoAdjust: defaultAutoAdjustSettings,
};
