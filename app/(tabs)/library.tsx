import { MiniPlayer } from "@/components/mini-player";
import { StyledText } from "@/components/styled-text";
import { TrackItem } from "@/components/track-item";
import { usePlayer } from "@/contexts/player-provider";
import { storageService } from "@/services/storage";
import { Track } from "@/types/track";
import { useFocusEffect, useRouter } from "expo-router";
import { Music, Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

export default function LibraryScreen() {
  const router = useRouter();
  const { state, controls } = usePlayer();
  const [library, setLibrary] = useState<Track[]>([]);

  const loadLibrary = useCallback(async () => {
    const tracks = await storageService.getLibrary();
    setLibrary(tracks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary]),
  );

  const handlePlayTrack = async (track: Track) => {
    await controls.play(track, library);

    // Navigate with full track data as params
    router.push({
      pathname: "/player",
      params: {
        trackId: track.id,
        trackTitle: track.title,
        trackUri: track.uri,
        trackArtist: track.artist || "",
        trackDuration: track.duration.toString(),
      },
    });
  };

  const handleImport = () => {
    router.push("/import");
  };

  const openPlayer = () => {
    router.push("/player");
  };

  if (library.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950">
        <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <StyledText variant="title" weight="bold">
            Library
          </StyledText>
          <TouchableOpacity
            onPress={handleImport}
            className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Plus size={20} color="#FFFFFF" />
            <StyledText className="text-white font-semibold ml-2">
              Import
            </StyledText>
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center mb-4">
            <Music size={40} color="#9CA3AF" />
          </View>
          <StyledText
            variant="title"
            weight="semibold"
            className="text-center mb-2"
          >
            Your library is empty
          </StyledText>
          <StyledText variant="body" className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Import songs from your device or add from URL to get started
          </StyledText>
          <TouchableOpacity
            onPress={handleImport}
            className="bg-blue-500 px-8 py-3 rounded-xl"
          >
            <StyledText className="text-white font-semibold">
              Import Music
            </StyledText>
          </TouchableOpacity>
        </View>

        {state.currentTrack && <MiniPlayer onPress={openPlayer} />}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <StyledText variant="title" weight="bold">
          Library
        </StyledText>
        <TouchableOpacity
          onPress={handleImport}
          className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Plus size={20} color="#FFFFFF" />
          <StyledText className="text-white font-semibold ml-2">
            Import
          </StyledText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pb-20">
        {library.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            onPress={() => handlePlayTrack(track)}
            isPlaying={state.currentTrack?.id === track.id}
          />
        ))}
      </ScrollView>

      {state.currentTrack && <MiniPlayer onPress={openPlayer} />}
    </View>
  );
}
