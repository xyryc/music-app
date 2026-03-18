import { audioService } from "@/services/audio";
import { storageService } from "@/services/storage";
import { PlayerControls, PlayerState, RepeatMode } from "@/types/player";
import { Track } from "@/types/track";
import { useCallback, useEffect, useRef, useState } from "react";

type PlaybackStatus = any;

const defaultPlayerState: PlayerState = {
  isPlaying: false,
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  position: 0,
  duration: 0,
  volume: 1,
  repeatMode: "off",
  isShuffled: false,
  shuffledQueue: [],
};

export function usePlayer() {
  const [state, setState] = useState<PlayerState>(defaultPlayerState);
  const statusUpdateRef = useRef<number | null>(null);

  useEffect(() => {
    audioService.initialize();
    return () => {
      audioService.unload();
      if (statusUpdateRef.current) {
        window.clearInterval(statusUpdateRef.current);
      }
    };
  }, []);

  const handleStatusUpdate = useCallback((status: PlaybackStatus) => {
    if (!status.isLoaded) return;

    setState((prev) => ({
      ...prev,
      isPlaying: status.isPlaying,
      position: status.positionMillis || 0,
      duration: status.durationMillis || 0,
    }));

    if (status.didJustFinish && !status.isPlaying) {
      handleTrackEnd();
    }
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      statusUpdateRef.current = window.setInterval(async () => {
        const status = await audioService.getStatus();
        if (status && "isPlaying" in status) {
          handleStatusUpdate(status as PlaybackStatus);
        }
      }, 1000);
    } else if (statusUpdateRef.current) {
      window.clearInterval(statusUpdateRef.current);
    }

    return () => {
      if (statusUpdateRef.current) {
        window.clearInterval(statusUpdateRef.current);
      }
    };
  }, [state.isPlaying, handleStatusUpdate]);

  const handleTrackEnd = useCallback(() => {
    setState((prev) => {
      if (prev.repeatMode === "one") {
        audioService.seek(0);
        audioService.play();
        return prev;
      }

      if (
        prev.repeatMode === "all" ||
        prev.queueIndex < prev.queue.length - 1
      ) {
        setTimeout(() => playNext(), 0);
      }

      return prev;
    });
  }, []);

  const play = useCallback(
    async (track?: Track, queue?: Track[]) => {
      try {
        let trackToPlay = track || state.currentTrack;
        let queueToUse = queue || state.queue;

        if (!trackToPlay) return;

        if (queue || (track && !state.queue.some((t) => t.id === track.id))) {
          if (!queue && track) {
            queueToUse = [track];
          }
          setState((prev) => ({
            ...prev,
            queue: queueToUse,
            queueIndex: track
              ? queueToUse.findIndex((t) => t.id === track.id)
              : 0,
          }));
        }

        await storageService.saveQueue(queueToUse);

        const loaded = await audioService.loadTrack(
          trackToPlay,
          handleStatusUpdate,
        );
        console.log("🎯 Track loaded result:", loaded);
        if (loaded) {
          console.log("▶️ Calling audioService.play()...");
          const playResult = await audioService.play();
          console.log("▶️ Play result:", playResult);

          console.log("🔊 Setting volume:", state.volume);
          await audioService.setVolume(state.volume);

          console.log("📝 Updating state with track:", trackToPlay.title);
          setState((prev) => {
            console.log("📝 State updater called");
            return {
              ...prev,
              currentTrack: trackToPlay,
              isPlaying: true,
            };
          });
          console.log("✅ State update complete");

          const library = await storageService.getLibrary();
          const updatedLibrary = library.map((t) =>
            t.id === trackToPlay.id
              ? { ...t, playCount: t.playCount + 1, lastPlayed: Date.now() }
              : t,
          );
          await storageService.saveLibrary(updatedLibrary);
          console.log("📚 Library updated");
        } else {
          console.log("❌ Track failed to load");
        }
      } catch (error) {
        console.error("Error playing track:", error);
      }
    },
    [state.currentTrack, state.queue, state.volume, handleStatusUpdate],
  );

  const pause = useCallback(async () => {
    try {
      await audioService.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    } catch (error) {
      console.error("Error pausing:", error);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [state.isPlaying, pause, play]);

  const stop = useCallback(async () => {
    try {
      await audioService.stop();
      setState((prev) => ({ ...prev, isPlaying: false, position: 0 }));
    } catch (error) {
      console.error("Error stopping:", error);
    }
  }, []);

  const seek = useCallback(async (position: number) => {
    try {
      await audioService.seek(position);
      setState((prev) => ({ ...prev, position }));
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    await audioService.setVolume(normalizedVolume);
    setState((prev) => ({ ...prev, volume: normalizedVolume }));
  }, []);

  const playNext = useCallback(async () => {
    setState((prev) => {
      const nextIndex = prev.queueIndex + 1;
      if (nextIndex < prev.queue.length) {
        const nextTrack = prev.queue[nextIndex];
        audioService.loadTrack(nextTrack, handleStatusUpdate);
        audioService.play();
        return {
          ...prev,
          currentTrack: nextTrack,
          queueIndex: nextIndex,
          isPlaying: true,
        };
      } else if (prev.repeatMode === "all") {
        const firstTrack = prev.queue[0];
        audioService.loadTrack(firstTrack, handleStatusUpdate);
        audioService.play();
        return {
          ...prev,
          currentTrack: firstTrack,
          queueIndex: 0,
          isPlaying: true,
        };
      }
      return prev;
    });
  }, [handleStatusUpdate]);

  const playPrevious = useCallback(async () => {
    setState((prev) => {
      if (prev.position > 3000) {
        audioService.seek(0);
        return prev;
      }

      const prevIndex = prev.queueIndex - 1;
      if (prevIndex >= 0) {
        const prevTrack = prev.queue[prevIndex];
        audioService.loadTrack(prevTrack, handleStatusUpdate);
        audioService.play();
        return {
          ...prev,
          currentTrack: prevTrack,
          queueIndex: prevIndex,
          isPlaying: true,
        };
      }
      return prev;
    });
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setState((prev) => ({ ...prev, repeatMode: mode }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const isShuffled = !prev.isShuffled;
      let shuffledQueue = prev.queue;

      if (isShuffled) {
        shuffledQueue = [...prev.queue].sort(() => Math.random() - 0.5);
      }

      return {
        ...prev,
        isShuffled,
        shuffledQueue,
        queue: isShuffled ? shuffledQueue : prev.queue,
      };
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState((prev) => ({
      ...prev,
      queue: [...prev.queue, track],
    }));
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setState((prev) => ({
      ...prev,
      queue: prev.queue.filter((t) => t.id !== trackId),
    }));
  }, []);

  const clearQueue = useCallback(() => {
    setState((prev) => ({
      ...prev,
      queue: [],
      queueIndex: -1,
    }));
  }, []);

  const controls: PlayerControls = {
    play,
    pause,
    togglePlayPause,
    stop,
    seek,
    setVolume,
    playNext,
    playPrevious,
    setRepeatMode,
    toggleShuffle,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return { state, controls };
}
