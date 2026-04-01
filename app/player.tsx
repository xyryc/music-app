import { NowPlayingScreen } from "@/components/now-playing-screen";
import { usePlayer } from "@/contexts/player-provider";
import { Track } from "@/types/track";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, controls } = usePlayer();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const playInitiatedRef = useRef(false);

  useEffect(() => {
    // Handle track from navigation params
    if (params.trackUri && !playInitiatedRef.current) {
      const track: Track = {
        id: params.trackId as string,
        title: params.trackTitle as string,
        uri: params.trackUri as string,
        artist: (params.trackArtist as string) || "Unknown Artist",
        duration: parseInt(params.trackDuration as string) || 0,
        source: "local",
        dateAdded: Date.now(),
        playCount: 0,
      };

      // Set local state and trigger playback
      setCurrentTrack(track);
      setIsLoading(false);
      playInitiatedRef.current = true;

      // Start playback - pass the track directly so it loads and plays
      controls.play(track);
    }
    // Sync with global state - use state.currentTrack as the source of truth
    else if (state.currentTrack) {
      setCurrentTrack(state.currentTrack);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [
    params.trackUri,
    params.trackId,
    params.trackTitle,
    params.trackArtist,
    params.trackDuration,
    state.currentTrack?.id,
    state.currentTrack?.title,
  ]);

  const handleMinimize = () => {
    router.back();
  };

  if (!state.currentTrack) {
    return (
      <View style={styles.container}>
        <Text className="text-white text-lg">No track playing</Text>
      </View>
    );
  }

  return (
    <NowPlayingScreen onMinimize={handleMinimize} initialTrack={state.currentTrack} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
});