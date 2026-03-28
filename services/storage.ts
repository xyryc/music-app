import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  LIBRARY: "music_player_library",
  PLAYLISTS: "music_player_playlists",
  SETTINGS: "music_player_settings",
  QUEUE: "music_player_queue",
};

export interface AppSettings {
  theme: "light" | "dark" | "system";
  skipSilence: boolean;
  equalizerEnabled: boolean;
  showLyrics: boolean;
}

const defaultSettings: AppSettings = {
  theme: "system",
  skipSilence: false,
  equalizerEnabled: false,
  showLyrics: false,
};

class StorageService {
  // Library
  async getLibrary(): Promise<Track[]> {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.LIBRARY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting library:", error);
      return [];
    }
  }

  async saveLibrary(tracks: Track[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.LIBRARY,
        JSON.stringify(tracks),
      );
    } catch (error) {
      console.error("Error saving library:", error);
    }
  }

  async addToLibrary(track: Track): Promise<void> {
    const library = await this.getLibrary();
    const exists = library.some((t) => t.uri === track.uri);
    if (!exists) {
      library.push(track);
      await this.saveLibrary(library);
    }
  }

  async removeFromLibrary(trackId: string): Promise<void> {
    const library = await this.getLibrary();
    const filtered = library.filter((t) => t.id !== trackId);
    await this.saveLibrary(filtered);
  }

  async getTrack(trackId: string): Promise<Track | null> {
    const library = await this.getLibrary();
    return library.find((t) => t.id === trackId) || null;
  }

  async updateTrack(track: Track): Promise<void> {
    const library = await this.getLibrary();
    const index = library.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      library[index] = track;
      await this.saveLibrary(library);
    }
  }

  // Playlists
  async getPlaylists(): Promise<Playlist[]> {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting playlists:", error);
      return [];
    }
  }

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.PLAYLISTS,
        JSON.stringify(playlists),
      );
    } catch (error) {
      console.error("Error saving playlists:", error);
    }
  }

  async createPlaylist(playlist: Playlist): Promise<void> {
    const playlists = await this.getPlaylists();
    playlists.push(playlist);
    await this.savePlaylists(playlists);
  }

  async updatePlaylist(playlist: Playlist): Promise<void> {
    const playlists = await this.getPlaylists();
    const index = playlists.findIndex((p) => p.id === playlist.id);
    if (index !== -1) {
      playlists[index] = playlist;
      await this.savePlaylists(playlists);
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    const playlists = await this.getPlaylists();
    const filtered = playlists.filter((p) => p.id !== playlistId);
    await this.savePlaylists(filtered);
  }

  async getPlaylist(playlistId: string): Promise<Playlist | null> {
    const playlists = await this.getPlaylists();
    return playlists.find((p) => p.id === playlistId) || null;
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.SETTINGS);
      return data
        ? { ...defaultSettings, ...JSON.parse(data) }
        : defaultSettings;
    } catch (error) {
      console.error("Error getting settings:", error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  // Queue
  async getQueue(): Promise<Track[]> {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting queue:", error);
      return [];
    }
  }

  async saveQueue(tracks: Track[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.QUEUE,
        JSON.stringify(tracks),
      );
    } catch (error) {
      console.error("Error saving queue:", error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await Promise.all(
        Object.values(STORAGE_KEYS).map((key) =>
          SecureStore.deleteItemAsync(key),
        ),
      );
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }
}

export const storageService = new StorageService();
