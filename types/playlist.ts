import { Track } from './track';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistInput {
  name: string;
  description?: string;
  coverArt?: string;
  trackIds?: string[];
}

export interface PlaylistWithTracks extends Playlist {
  tracks: Track[];
}
