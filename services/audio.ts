import { Track } from "@/types/track";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { getInfoAsync } from "expo-file-system/legacy";
import {
  addListener,
  Command,
  disableMediaControls,
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
  private player: AudioPlayer | null = null;
  private onStatusUpdate: ((status: PlaybackStatus) => void) | null = null;
  private onTrackEnd: (() => void) | null = null;
  private remoteListenerCleanup: (() => void) | null = null;
  private statusListenerCleanup: (() => void) | null = null;
  private currentTrack: Track | null = null;

  async initialize() {
    try {
      // Clean up any stale media session from a previous app session
      // (e.g., if the app was swiped away and the foreground service
      //  outlived the activity). This prevents lingering audio playback
      //  and stale notifications on the next app launch.
      try {
        await this.unload();
        await disableMediaControls();
      } catch {
        // Ignore errors during cleanup — the session may already be gone
      }

      await setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
        shouldRouteThroughEarpiece: false,
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
          showWhenClosed: false,
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
            if (this.onTrackEnd) this.onTrackEnd();
            break;
          case Command.PREVIOUS_TRACK:
            await this.playPreviousFromRemote();
            break;
        }
      });
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  private syncMediaControls(status?: PlaybackStatus) {
    if (!this.currentTrack) return;

    const resolved = status ?? this.getStatusSync();
    const isLoaded = !!resolved && resolved.isLoaded;
    const positionSeconds = isLoaded ? resolved.positionMillis / 1000 : 0;
    const durationSeconds = isLoaded
      ? (resolved.durationMillis || this.currentTrack.duration || 0) / 1000
      : (this.currentTrack.duration || 0) / 1000;

    const artworkUri = this.currentTrack.coverArt;

    void updateMetadata({
      title: this.currentTrack.title || "Unknown Track",
      artist: this.currentTrack.artist || "Unknown Artist",
      album: this.currentTrack.album || "",
      artwork: artworkUri ? { uri: artworkUri, width: 256, height: 256 } : undefined,
      duration: durationSeconds,
      elapsedTime: positionSeconds,
      color: "#0A7EA4",
      colorized: true,
    });

    void updatePlaybackState(
      isLoaded && resolved.isPlaying ? PlaybackState.PLAYING : PlaybackState.PAUSED,
      positionSeconds,
      isLoaded && resolved.isPlaying ? 1 : 0,
    );
  }

  private getStatusSync(): PlaybackStatus | null {
    if (!this.player) return null;

    return {
      isLoaded: this.player.isLoaded,
      isPlaying: this.player.playing,
      positionMillis: Math.round(this.player.currentTime * 1000),
      durationMillis: Math.round(this.player.duration * 1000),
      didJustFinish: this.player.currentStatus?.didJustFinish,
    };
  }

  private handlePlaybackStatus(status: AudioStatus) {
    if (!status.isLoaded) return;

    const mapped: PlaybackStatus = {
      isLoaded: true,
      isPlaying: status.playing,
      positionMillis: Math.round(status.currentTime * 1000),
      durationMillis: Math.round(status.duration * 1000),
      didJustFinish: status.didJustFinish,
    };

    this.onStatusUpdate?.(mapped);
    this.syncMediaControls(mapped);

    if (status.didJustFinish && this.onTrackEnd) {
      this.onTrackEnd();
    }
  }

  private emitCurrentStatus() {
    const status = this.player?.currentStatus;
    if (status) this.handlePlaybackStatus(status);
  }

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
          console.error("Audio file not found at URI:", track.uri);
          throw new Error("Audio file not found. Please re-import the track.");
        }
      }

      this.player = createAudioPlayer(
        { uri: track.uri },
        {
          updateInterval: 500,
          downloadFirst: false,
          keepAudioSessionActive: false,
          preferredForwardBufferDuration: 0,
        },
      );

      const statusSubscription = (this.player as any).addListener(
        "playbackStatusUpdate",
        (status: AudioStatus) => this.handlePlaybackStatus(status),
      );
      this.statusListenerCleanup = () => statusSubscription.remove();

      if (shouldPlay) {
        this.player.play();
      }

      this.emitCurrentStatus();
      this.syncMediaControls(this.getStatusSync() || undefined);
      return true;
    } catch (error) {
      console.error("Error loading track:", error);
      console.error("URI was:", track.uri);
      return false;
    }
  }

  async play() {
    try {
      if (this.player) {
        this.player.play();
        this.syncMediaControls();
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
      if (this.player) {
        this.player.pause();
        this.syncMediaControls();
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
      if (this.player) {
        this.player.pause();
        await this.player.seekTo(0);
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
      this.statusListenerCleanup?.();
      this.statusListenerCleanup = null;
      if (this.player) {
        this.player.remove();
        this.player = null;
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("Player does not exist")) {
        console.error("Error unloading:", error);
      }
      return false;
    }
  }

  async seek(positionMillis: number) {
    try {
      if (this.player) {
        await this.player.seekTo(positionMillis / 1000);
        this.syncMediaControls();
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
      if (this.player) {
        this.player.volume = Math.max(0, Math.min(1, volume));
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
      return this.getStatusSync();
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
      return this.getStatusSync()?.durationMillis || 0;
    } catch {
      return 0;
    }
  }

  async getPosition(): Promise<number> {
    try {
      return this.getStatusSync()?.positionMillis || 0;
    } catch {
      return 0;
    }
  }

  async isPlaying(): Promise<boolean> {
    return this.getStatusSync()?.isPlaying || false;
  }

  async cleanup() {
    try {
      if (this.remoteListenerCleanup) {
        this.remoteListenerCleanup();
        this.remoteListenerCleanup = null;
      }
      await removeAllListeners();
      await disableMediaControls();
    } catch (error) {
      console.error("Error cleaning up media controls:", error);
    }
  }

  private async playPreviousFromRemote() {
    if (this.onTrackEnd) {
      this.onTrackEnd();
    }
  }
}

export const audioService = new AudioService();
