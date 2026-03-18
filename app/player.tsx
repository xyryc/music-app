import { NowPlayingScreen } from "@/components/now-playing-screen";
import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/hooks/use-player";
import { storageService } from "@/services/storage";
import { Track } from "@/types/track";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, controls } = usePlayer();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Priority 1: Use track from params if available
    if (params.trackUri) {
      const track: Track = {
        id: params.trackId as string,
        title: params.trackTitle as string,
        uri: params.trackUri as string,
        artist: params.trackArtist as string,
        duration: parseInt(params.trackDuration as string) || 0,
        source: "local",
        dateAdded: Date.now(),
        playCount: 0,
      };
      setCurrentTrack(track);

      // Also start playing it via controls
      controls.play(track);
      setIsLoading(false);
      return;
    }

    // Priority 2: Fall back to global state
    if (state.currentTrack) {
      setCurrentTrack(state.currentTrack);
      setIsLoading(false);
      return;
    }

    // Priority 3: Try to load from library by trackId
    if (params.trackId && !state.currentTrack) {
      loadTrackFromLibrary(params.trackId as string);
      return;
    }

    setIsLoading(false);
  }, [params.trackUri, params.trackId, state.currentTrack]);

  const loadTrackFromLibrary = async (trackId: string) => {
    try {
      const library = await storageService.getLibrary();
      const track = library.find((t) => t.id === trackId);

      if (track) {
        setCurrentTrack(track);
        controls.play(track);
      }
    } catch (error) {
      console.error("Error loading track:", error);
    }
    setIsLoading(false);
  };

  const handleMinimize = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 items-center justify-center">
        <StyledText className="text-white text-lg">Loading...</StyledText>
      </View>
    );
  }

  if (!currentTrack) {
    return (
      <View className="flex-1 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 items-center justify-center">
        <StyledText className="text-white text-lg">No track playing</StyledText>
      </View>
    );
  }

  return (
    <NowPlayingScreen onMinimize={handleMinimize} initialTrack={currentTrack} />
  );
}
