import { usePlayer as usePlayerHook } from "@/hooks/use-player";
import { PlayerControls, PlayerState } from "@/types/player";
import React, { createContext, ReactNode, useContext, useMemo } from "react";

interface PlayerContextType {
  state: PlayerState;
  controls: PlayerControls;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = usePlayerHook();

  // CRITICAL: Memoize the context value so it updates when state changes
  const contextValue = useMemo(
    () => ({
      state: player.state,
      controls: player.controls,
    }),
    [player.state, player.controls],
  );

  console.log(
    "PlayerProvider: state.currentTrack =",
    contextValue.state.currentTrack?.title,
  );
  console.log("PlayerProvider: isPlaying =", contextValue.state.isPlaying);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  console.log(
    "usePlayer() called, returning track:",
    context.state.currentTrack?.title,
  );
  return context;
}
