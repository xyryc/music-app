import { usePlayer as usePlayerHook } from "@/hooks/use-player";
import { PlayerControls, PlayerState } from "@/types/player";
import React, { createContext, ReactNode, useContext } from "react";

interface PlayerContextType {
  state: PlayerState;
  controls: PlayerControls;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = usePlayerHook();

  return (
    <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
