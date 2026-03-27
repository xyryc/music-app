import { Track } from "@/types/track";
import { Audio, AVPlaybackStatus } from "expo-av";
import { getInfoAsync } from "expo-file-system/legacy";
import {
  addListener,
  Command,
  enableMediaControls,
  PlaybackState,
  removeAllListeners,
  updateMetadata,
  updatePlaybackState,
} from "expo-media-control";

type PlaybackStatus = {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  didJustFinish?: boolean;
};

class AudioService {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: ((status: PlaybackStatus) => void) | null = null;
  private onTrackEnd: (() => void) | null = null;
  private remoteListenerCleanup: (() => void) | null = null;
  private currentTrack: Track | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      await enableMediaControls({
        capabilities: [
          Command.PLAY,
          Command.PAUSE,
          Command.NEXT_TRACK,
          Command.PREVIOUS_TRACK,
          Command.SEEK,
          Command.STOP,
        ],
        compactCapabilities: [
          Command.PREVIOUS_TRACK,
          Command.PLAY,
          Command.NEXT_TRACK,
        ],
        notification: {
          showWhenClosed: true,
          color: "#0A7EA4",
        },
        android: {
          skipInterval: 10,
        },
        ios: {
          skipInterval: 10,
        },
      });

      this.remoteListenerCleanup = addListener(async (event) => {
        switch (event.command) {
          case Command.PLAY:
            await this.play();
            break;
          case Command.PAUSE:
            await this.pause();
            break;
          case Command.STOP:
            await this.stop();
            break;
          case Command.SEEK:
            await this.seek((event.data?.position ?? 0) * 1000);
            break;
          case Command.NEXT_TRACK:
          case Command.PREVIOUS_TRACK:
            if (this.onTrackEnd) {
              this.onTrackEnd();
            }
            break;
        }
      });
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  private async syncMediaControls(status?: AVPlaybackStatus) {
    if (!this.currentTrack) return;

    const resolvedStatus = status ?? (await this.getRawStatus());
    const isLoaded = !!resolvedStatus && resolvedStatus.isLoaded;
    const positionSeconds = isLoaded
      ? (resolvedStatus.positionMillis ?? 0) / 1000
      : 0;
    const durationSeconds = isLoaded
      ? (resolvedStatus.durationMillis ?? this.currentTrack.duration ?? 0) / 1000
      : (this.currentTrack.duration ?? 0) / 1000;

    // Build artwork URI - prefer coverArt, fallback to a default
    const artworkUri = this.currentTrack.coverArt?.startsWith("http")
      ? this.currentTrack.coverArt
      : this.currentTrack.coverArt;

    await updateMetadata({
      title: this.currentTrack.title || "Unknown Track",
      artist: this.currentTrack.artist || "Unknown Artist",
      album: this.currentTrack.album || "",
      artwork: artworkUri
        ? { uri: artworkUri, width: 256, height: 256 }
        : undefined,
      duration: durationSeconds,
      elapsedTime: positionSeconds,
      color: "#0A7EA4",
      colorized: true,
    });

    await updatePlaybackState(
      isLoaded && resolvedStatus.isPlaying
        ? PlaybackState.PLAYING
        : PlaybackState.PAUSED,
      positionSeconds,
      isLoaded && resolvedStatus.isPlaying ? 1 : 0,
    );
  }

  private async getRawStatus(): Promise<AVPlaybackStatus | null> {
    try {
      if (this.sound) {
        return await this.sound.getStatusAsync();
      }
      return null;
    } catch (error) {
      console.error("Error getting raw status:", error);
      return null;
    }
  }

  private handleExpoStatus = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const mapped: PlaybackStatus = {
      isLoaded: true,
      isPlaying: status.isPlaying,
      positionMillis: status.positionMillis ?? 0,
      durationMillis: status.durationMillis ?? 0,
      didJustFinish: status.didJustFinish,
    };

    if (this.onStatusUpdate) {
      this.onStatusUpdate(mapped);
    }

    await this.syncMediaControls(status);

    if (status.didJustFinish && this.onTrackEnd) {
      this.onTrackEnd();
    }
  };


  async loadTrack(
    track: Track,
    onStatusUpdate?: (status: PlaybackStatus) => void,
    shouldPlay: boolean = true,
  ) {
    try {
      await this.unload();
      this.currentTrack = track;
      this.onStatusUpdate = onStatusUpdate || null;

      if (track.source === "local" || track.uri.startsWith("file://")) {
        const fileInfo = await getInfoAsync(track.uri);
        if (!fileInfo.exists) {
          throw new Error("Audio file not found. Please re-import the track.");
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: shouldPlay,
          isLooping: false,
          volume: 1,
          androidImplementation: "MediaPlayer",
        },
        this.handleExpoStatus,
      );

      this.sound = sound;
      return true;
    } catch (error) {
      console.error("Error loading track:", error);
      return false;
    }
  }

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        await this.syncMediaControls();
        return true;
      }
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
        await this.syncMediaControls();
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
        await updatePlaybackState(PlaybackState.STOPPED, 0, 0);
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
        await this.syncMediaControls();
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
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          return {
            isLoaded: true,
            isPlaying: status.isPlaying,
            positionMillis: status.positionMillis ?? 0,
            durationMillis: status.durationMillis ?? 0,
            didJustFinish: status.didJustFinish,
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting status:", error);
      return null;
    }
  }

  async setOnStatusUpdate(callback: (status: PlaybackStatus) => void) {
    this.onStatusUpdate = callback;
  }

  async setOnTrackEnd(callback: () => void) {
    this.onTrackEnd = callback;
  }

  async getDuration(): Promise<number> {
    try {
      const status = await this.getStatus();
      return status?.durationMillis || 0;
    } catch {
      return 0;
    }
  }

  async getPosition(): Promise<number> {
    try {
      const status = await this.getStatus();
      return status?.positionMillis || 0;
    } catch {
      return 0;
    }
  }

  async isPlaying(): Promise<boolean> {
    const status = await this.getStatus();
    return status?.isPlaying || false;
  }

  async cleanup() {
    try {
      if (this.remoteListenerCleanup) {
        this.remoteListenerCleanup();
        this.remoteListenerCleanup = null;
      }
      await removeAllListeners();
    } catch (error) {
      console.error("Error cleaning up media controls:", error);
    }
  }
}

export const audioService = new AudioService();