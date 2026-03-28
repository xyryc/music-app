import { MiniPlayer } from "@/components/mini-player";
import { ScreenGradient } from "@/components/screen-gradient";
import { TrackOptionsSheet } from "@/components/track-options-modal";
import { StyledText } from "@/components/styled-text";
import { TrackItem } from "@/components/track-item";
import { usePlayer } from "@/contexts/player-provider";
import { useCoverArt } from "@/contexts/cover-art-context";
import { storageService } from "@/services/storage";
import { Track } from "@/types/track";
import { useFocusEffect, useRouter } from "expo-router";
import { Music, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useState, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import SwipeableFlatList from "react-native-swipeable-list";

type SwipeableRenderInfo<T> = {
  item: T;
  index: number;
};

export default function LibraryScreen() {
  const router = useRouter();
  const { state, controls } = usePlayer();
  const { selectedCover, clearCoverSelection } = useCoverArt();
  const [library, setLibrary] = useState<Track[]>([]);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedTrackForOptions, setSelectedTrackForOptions] = useState<Track | null>(null);

  const loadLibrary = useCallback(async () => {
    const tracks = await storageService.getLibrary();
    setLibrary(tracks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary]),
  );

  const handleUpdateTrackCover = useCallback(async (track: Track, coverUrl: string) => {
    try {
      const updatedTrack = { ...track, coverArt: coverUrl };
      await storageService.updateTrack(updatedTrack);

      setLibrary((prevLibrary) =>
        prevLibrary.map((item) =>
          item.id === track.id ? updatedTrack : item
        )
      );
    } catch (error) {
      console.error("Failed to update track cover:", error);
    }
  }, []);

  useEffect(() => {
    if (selectedCover) {
      const { trackId, coverUrl } = selectedCover;
      const track = library.find((t) => t.id === trackId);
      if (track) {
        handleUpdateTrackCover(track, coverUrl);
        clearCoverSelection();
      }
    }
  }, [selectedCover, library, clearCoverSelection, handleUpdateTrackCover]);

  const handlePlayTrack = async (track: Track) => {
    await controls.play(track, library);
    router.push("/player");
  };

  const handleImport = () => {
    router.push("/import");
  };

  const openPlayer = () => {
    router.push("/player");
  };


  const handleShowOptionsModal = (track: Track) => {
    setSelectedTrackForOptions(track);
    setOptionsModalVisible(true);
  };

  const handleSearchCoverArt = (track: Track) => {
    router.push({
      pathname: "/cover-art-search",
      params: {
        track: JSON.stringify(track),
      },
    });
  };

  const handleRemoveTrack = useCallback(async (track: Track) => {
    try {
      await storageService.removeFromLibrary(track.id);
      setLibrary((prevLibrary) => prevLibrary.filter((item) => item.id !== track.id));

      if (selectedTrackForOptions?.id === track.id) {
        setOptionsModalVisible(false);
        setSelectedTrackForOptions(null);
      }

      if (state.currentTrack?.id === track.id) {
        await controls.stop();
      }
    } catch (error) {
      console.error("Failed to remove track:", error);
    }
  }, [controls, selectedTrackForOptions?.id, state.currentTrack?.id]);

  const renderQuickActions = ({ item }: SwipeableRenderInfo<Track>) => (
    <View className="flex-1 items-end justify-center px-4 bg-red-500">
      <TouchableOpacity
        onPress={() => handleRemoveTrack(item)}
        className="w-12 h-12 rounded-full bg-red-600 items-center justify-center"
      >
        <Trash2 size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderTrackItem = ({ item }: SwipeableRenderInfo<Track>) => (
    <TrackItem
      track={item}
      onPress={() => handlePlayTrack(item)}
      onLongPress={() => handleShowOptionsModal(item)}
      isPlaying={state.currentTrack?.id === item.id}
    />
  );

  const keyExtractor = (item: Track) => item.id;

  const maxSwipeDistance = () => 88;

  if (library.length === 0) {
    return (
      <ScreenGradient>
        <View className="flex-1">
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
      </ScreenGradient>
    );
  }

  return (
    <ScreenGradient>
      <View className="flex-1">
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

        <SwipeableFlatList
          data={library}
          keyExtractor={keyExtractor}
          renderItem={renderTrackItem}
          renderQuickActions={renderQuickActions}
          maxSwipeDistance={maxSwipeDistance}
          bounceFirstRowOnMount={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {state.currentTrack && <MiniPlayer onPress={openPlayer} />}

        <TrackOptionsSheet
          isVisible={optionsModalVisible}
          track={selectedTrackForOptions}
          onClose={() => {
            setOptionsModalVisible(false);
            setSelectedTrackForOptions(null);
          }}
          onSearchCoverArt={handleSearchCoverArt}
        />
      </View>
    </ScreenGradient>
  );
}
