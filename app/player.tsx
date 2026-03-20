import { NowPlayingScreen } from "@/components/now-playing-screen";
import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/hooks/use-player";
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
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Priority 1: Use track from params if available and not already loaded
    if (params.trackUri && !hasLoaded) {
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
      setHasLoaded(true);
      setIsLoading(false);

      // CRITICAL: Also load it into global player state so controls work
      controls.play(track);
      return;
    }

    // Priority 2: Fall back to global state
    if (state.currentTrack) {
      setCurrentTrack(state.currentTrack);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [
    params.trackUri,
    params.trackId,
    state.currentTrack,
    hasLoaded,
    controls,
  ]);

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
