import { Track } from "@/types/track";
import { Audio } from "expo-av";
import { getInfoAsync } from "expo-file-system/legacy";

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
    shouldPlay: boolean = true,
  ) {
    try {
      await this.unload();

      this.onStatusUpdate = onStatusUpdate || null;

      console.log("audioService.loadTrack() loading:", track.title, "shouldPlay:", shouldPlay);

      // Check if file exists if it's a local file
      if (track.source === 'local' || track.uri.startsWith('file://')) {
        const fileInfo = await getInfoAsync(track.uri);
        if (!fileInfo.exists) {
          console.error("❌ Audio file not found at URI:", track.uri);
          throw new Error("Audio file not found. Please re-import the track.");
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay,
          isLooping: false,
          volume: 1.0,
          androidImplementation: 'MediaPlayer', // Use MediaPlayer for better local file support on some Android devices
        },
        this.onStatusUpdate,
      );

      this.sound = sound;
      console.log("audioService.loadTrack() loaded successfully");
      return true;
    } catch (error) {
      console.error("❌ Error loading track:", error);
      console.error("❌ URI was:", track.uri);
      return false;
    }
  }

  async play() {
    try {
      console.log("audioService.play() called, sound exists:", !!this.sound);
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        console.log("audioService.play() status:", status?.isLoaded, status?.isPlaying);
        if (status.isLoaded) {
          await this.sound.playAsync();
          console.log("audioService.playAsync() completed");
          return true;
        }
      }
      console.log("audioService.play() failed: no sound instance");
      return false;
    } catch (error) {
      console.error("audioService.play() error:", error);
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

  async isPlaying(): Promise<boolean> {
    if (!this.sound) return false;
    const status = await this.getStatus();
    return status?.isPlaying || false;
  }
}

export const audioService = new AudioService();
