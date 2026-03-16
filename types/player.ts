import { Track } from './track';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  position: number; // current position in ms
  duration: number; // total duration in ms
  volume: number; // 0-1
  repeatMode: RepeatMode;
  isShuffled: boolean;
  shuffledQueue: Track[];
}

export interface PlayerControls {
  play: (track?: Track, queue?: Track[]) => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setVolume: (volume: number) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}
