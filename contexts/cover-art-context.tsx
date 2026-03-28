import React, { createContext, useContext, useState, useCallback } from "react";

interface CoverArtContextType {
  selectedCover: { trackId: string; coverUrl: string } | null;
  setCoverSelection: (trackId: string, coverUrl: string) => void;
  clearCoverSelection: () => void;
}

const CoverArtContext = createContext<CoverArtContextType | undefined>(undefined);

export const CoverArtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCover, setSelectedCover] = useState<{ trackId: string; coverUrl: string } | null>(null);

  const setCoverSelection = useCallback((trackId: string, coverUrl: string) => {
    setSelectedCover({ trackId, coverUrl });
  }, []);

  const clearCoverSelection = useCallback(() => {
    setSelectedCover(null);
  }, []);

  return (
    <CoverArtContext.Provider value={{ selectedCover, setCoverSelection, clearCoverSelection }}>
      {children}
    </CoverArtContext.Provider>
  );
};

export const useCoverArt = () => {
  const context = useContext(CoverArtContext);
  if (context === undefined) {
    throw new Error('useCoverArt must be used within a CoverArtProvider');
  }
  return context;
};