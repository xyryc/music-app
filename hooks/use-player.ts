import { audioService } from "@/services/audio";
import { storageService } from "@/services/storage";
import { PlayerControls, PlayerState, RepeatMode } from "@/types/player";
import { Track } from "@/types/track";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const currentTrackRef = useRef<Track | null>(null);

  useEffect(() => {
    audioService.initialize();
    return () => {
      audioService.unload();
      if (statusUpdateRef.current) {
        clearInterval(statusUpdateRef.current);
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
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      const status = await audioService.getStatus();
      if (status && status.isLoaded) {
        setState((prev) => ({
          ...prev,
          isPlaying: status.isPlaying,
          position: status.positionMillis || 0,
          duration: status.durationMillis || 0,
        }));
      }
    }, 500);
    statusUpdateRef.current = id;

    return () => {
      if (statusUpdateRef.current) {
        clearInterval(statusUpdateRef.current);
      }
    };
  }, []);

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
        const nextIndex = prev.queueIndex + 1;
        if (nextIndex < prev.queue.length) {
          const nextTrack = prev.queue[nextIndex];
          audioService.loadTrack(nextTrack, (status) => {
            if (status.isLoaded) {
              setState((s) => ({
                ...s,
                isPlaying: status.isPlaying,
                position: status.positionMillis || 0,
                duration: status.durationMillis || 0,
              }));
            }
          });
          audioService.play();
          return {
            ...prev,
            currentTrack: nextTrack,
            queueIndex: nextIndex,
            isPlaying: true,
          };
        } else if (prev.repeatMode === "all") {
          const firstTrack = prev.queue[0];
          audioService.loadTrack(firstTrack, (status) => {
            if (status.isLoaded) {
              setState((s) => ({
                ...s,
                isPlaying: status.isPlaying,
                position: status.positionMillis || 0,
                duration: status.durationMillis || 0,
              }));
            }
          });
          audioService.play();
          return {
            ...prev,
            currentTrack: firstTrack,
            queueIndex: 0,
            isPlaying: true,
          };
        }
      }

      return prev;
    });
  }, []);

  const play = useCallback(
    async (track?: Track, queue?: Track[]) => {
      console.log(
        "play() called with track:",
        track?.title || "none",
        "currentTrack:",
        currentTrackRef.current?.title || "none"
      );
      try {
        let trackToPlay = track || currentTrackRef.current;
        let queueToUse = queue || state.queue;

        if (!trackToPlay && queueToUse.length > 0) {
          trackToPlay = queueToUse[0];
        }

        if (!trackToPlay) {
          console.log("No track to play!");
          return;
        }

        // If we are already playing this track, just resume
        if (currentTrackRef.current?.id === trackToPlay.id && state.isPlaying) {
          console.log("Already playing this track");
          return;
        }

        // If we are paused on this track, just play
        if (currentTrackRef.current?.id === trackToPlay.id && !state.isPlaying) {
          console.log("Resuming current track");
          const success = await audioService.play();
          if (success) {
            setState(prev => ({ ...prev, isPlaying: true }));
          }
          return;
        }

        console.log("Loading new track:", trackToPlay.title);

        // Update queue if provided
        if (queue) {
          setState(prev => ({
            ...prev,
            queue: queue,
            queueIndex: queue.findIndex(t => t.id === trackToPlay!.id)
          }));
          await storageService.saveQueue(queue);
        } else if (track && !state.queue.some(t => t.id === track.id)) {
          // Add single track to queue if not present
          const newQueue = [...state.queue, track];
          setState(prev => ({
            ...prev,
            queue: newQueue,
            queueIndex: newQueue.length - 1
          }));
          await storageService.saveQueue(newQueue);
        }

        const loaded = await audioService.loadTrack(
          trackToPlay,
          handleStatusUpdate,
          true // shouldPlay
        );

        if (loaded) {
          currentTrackRef.current = trackToPlay;
          setState((prev) => ({
            ...prev,
            currentTrack: trackToPlay!,
            isPlaying: true,
            position: 0,
          }));

          // Track analytics/count
          storageService.getLibrary().then(async (library) => {
            const updatedLibrary = library.map((t) =>
              t.id === trackToPlay!.id
                ? { ...t, playCount: t.playCount + 1, lastPlayed: Date.now() }
                : t
            );
            await storageService.saveLibrary(updatedLibrary);
          });
        }
      } catch (error) {
        console.error("Error playing track:", error);
      }
    },
    [state.queue, state.currentTrack, handleStatusUpdate]
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
    console.log(
      "togglePlayPause called, isPlaying:",
      state.isPlaying,
      "currentTrack:",
      state.currentTrack?.title,
      "ref:",
      currentTrackRef.current?.title,
    );
    if (state.isPlaying) {
      console.log("Pausing...");
      await pause();
    } else {
      console.log("Playing...");
      // Pass the track from ref if state doesn't have it
      await play(currentTrackRef.current || undefined);
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

  const playNext = useCallback(() => {
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

  const controls = useMemo<PlayerControls>(() => ({
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
  }), [
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
  ]);

  return { state, controls };
}
