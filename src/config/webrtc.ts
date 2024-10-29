export const iceServers = [
  // Google's public STUN servers
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

export const mediaConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    sampleSize: 16,
    channelCount: 2,
  },
  video: false,
};

export const audioQualitySettings = {
  low: {
    sampleRate: 24000,
    bitrate: 32000,
    stereo: false,
  },
  medium: {
    sampleRate: 44100,
    bitrate: 64000,
    stereo: true,
  },
  high: {
    sampleRate: 48000,
    bitrate: 128000,
    stereo: true,
  },
};

export const peerConnectionConfig = {
  iceServers,
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 0,
} as RTCConfiguration;