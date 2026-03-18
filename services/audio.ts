import { Track } from "@/types/track";
import { Audio } from "expo-av";

type PlaybackStatus = any;

class AudioService {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: ((status: PlaybackStatus) => void) | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  async loadTrack(
    track: Track,
    onStatusUpdate?: (status: PlaybackStatus) => void,
  ) {
    try {
      await this.unload();

      this.onStatusUpdate = onStatusUpdate || null;

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: false,
          isLooping: false,
        },
        this.onStatusUpdate,
      );

      this.sound = sound;
      return true;
    } catch (error) {
      console.error("❌ Error loading track:", error);
      console.error("❌ URI was:", track.uri);
      return false;
    }
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error playing:", error);
      return false;
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error pausing:", error);
      return false;
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
      }
      return true;
    } catch (error) {
      console.error("Error stopping:", error);
      return false;
    }
  }

  async unload() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      return true;
    } catch (error) {
      console.error("Error unloading:", error);
      return false;
    }
  }

  async seek(positionMillis: number) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error seeking:", error);
      return false;
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error setting volume:", error);
      return false;
    }
  }

  async getStatus(): Promise<PlaybackStatus | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error("Error getting status:", error);
      return null;
    }
  }

  async setOnStatusUpdate(callback: (status: PlaybackStatus) => void) {
    this.onStatusUpdate = callback;
    if (this.sound) {
      await this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  async getDuration(): Promise<number> {
    try {
      if (this.sound) {
        const status = await this.getStatus();
        if (status && "durationMillis" in status) {
          return (status as any).durationMillis || 0;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async getPosition(): Promise<number> {
    try {
      if (this.sound) {
        const status = await this.getStatus();
        if (status && "positionMillis" in status) {
          return (status as any).positionMillis || 0;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  }

  isPlaying(): boolean {
    return false;
  }
}

export const audioService = new AudioService();
