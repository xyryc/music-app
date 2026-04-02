import { NowPlayingScreen } from "@/components/now-playing-screen";
import { usePlayer } from "@/contexts/player-provider";
import { Track } from "@/types/track";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, controls } = usePlayer();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const playInitiatedRef = useRef(false);

  const queueFromParams = useMemo(() => {
    if (typeof params.queue !== "string") {
      return null;
    }

    try {
      const parsed = JSON.parse(params.queue);
      return Array.isArray(parsed) ? (parsed as Track[]) : null;
    } catch {
      return null;
    }
  }, [params.queue]);

  const trackFromParams = useMemo(() => {
    if (!params.trackUri) {
      return null;
    }

    return {
      id: params.trackId as string,
      title: params.trackTitle as string,
      uri: params.trackUri as string,
      artist: (params.trackArtist as string) || "Unknown Artist",
      duration: parseInt(params.trackDuration as string) || 0,
      source: "local",
      dateAdded: Date.now(),
      playCount: 0,
    } satisfies Track;
  }, [
    params.trackUri,
    params.trackId,
    params.trackTitle,
    params.trackArtist,
    params.trackDuration,
  ]);

  const playbackQueue = useMemo(() => {
    if (queueFromParams && queueFromParams.length > 0) {
      return queueFromParams;
    }

    return trackFromParams ? [trackFromParams] : undefined;
  }, [queueFromParams, trackFromParams]);

  useEffect(() => {
    if (trackFromParams && !playInitiatedRef.current) {
      setCurrentTrack(trackFromParams);
      setIsLoading(false);
      playInitiatedRef.current = true;

      void controls.play(trackFromParams, playbackQueue);
    } else if (state.currentTrack) {
      setCurrentTrack(state.currentTrack);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [
    trackFromParams,
    playbackQueue,
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