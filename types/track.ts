export type TrackSource = 'local' | 'url' | 'youtube';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number; // in milliseconds
  uri: string;
  source: TrackSource;
  coverArt?: string;
  coverArtBlurhash?: string;
  dateAdded: number;
  playCount: number;
  lastPlayed?: number;
}

export interface TrackInput {
  title: string;
  artist?: string;
  album?: string;
  uri: string;
  source: TrackSource;
  coverArt?: string;
  coverArtBlurhash?: string;
  duration?: number;
}
