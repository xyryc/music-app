import { ScreenGradient } from "@/components/screen-gradient";
import { usePlayer } from "@/contexts/player-provider";
import { storageService } from "@/services/storage";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { toast } from "@baronha/ting";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Music, Plus, Trash2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FAVORITES_PLAYLIST_ID = "favorites";
const FAVORITES_PLAYLIST_NAME = "favorites";

export default function PlaylistsScreen() {
  const router = useRouter();
  const { controls } = usePlayer();
  const { colorScheme } = useColorScheme();
  const sheetRef = useRef<TrueSheet>(null);
  const actionSheetRef = useRef<TrueSheet>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreateSheetVisible, setIsCreateSheetVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [actionSheetType, setActionSheetType] = useState<"delete" | "empty" | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const syncSheet = async () => {
      if (!sheetRef.current) {
        return;
      }

      if (isCreateSheetVisible) {
        await sheetRef.current.present();
      } else {
        await sheetRef.current.dismiss();
      }
    };

    syncSheet();
  }, [isCreateSheetVisible]);

  useEffect(() => {
    const syncActionSheet = async () => {
      if (!actionSheetRef.current) {
        return;
      }

      if (actionSheetType) {
        await actionSheetRef.current.present();
      } else {
        await actionSheetRef.current.dismiss();
      }
    };

    syncActionSheet();
  }, [actionSheetType]);

  const handleCloseCreatePlaylistSheet = () => {
    setIsCreateSheetVisible(false);
    setNewPlaylistName("");
    setIsCreatingPlaylist(false);
  };

  const handleShowCreatePlaylistSheet = () => {
    setIsCreateSheetVisible(true);
  };

  const loadPlaylists = useCallback(async () => {
    const data = await storageService.getPlaylists();
    setPlaylists(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, [loadPlaylists]),
  );

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || isCreatingPlaylist) {
      return;
    }

    try {
      setIsCreatingPlaylist(true);

      const now = Date.now();
      const newPlaylist: Playlist = {
        id: `${now}`,
        name: newPlaylistName.trim(),
        trackIds: [],
        createdAt: now,
        updatedAt: now,
      };

      await storageService.createPlaylist(newPlaylist);
      await loadPlaylists();
      handleCloseCreatePlaylistSheet();
      toast({
        title: "Playlist created",
        message: `"${newPlaylist.name}" is ready.`,
        preset: "done",
      });
    } catch (error) {
      console.error("Failed to create playlist:", error);
      toast({
        title: "Error",
        message: "Could not create playlist.",
        preset: "error",
      });
      setIsCreatingPlaylist(false);
    }
  };

  const handleRequestDeletePlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActionSheetType("delete");
  };

  const handleConfirmDeletePlaylist = async () => {
    if (!selectedPlaylist) {
      return;
    }

    const playlistName = selectedPlaylist.name;
    await storageService.deletePlaylist(selectedPlaylist.id);
    await loadPlaylists();
    setActionSheetType(null);
    setSelectedPlaylist(null);
    toast({
      title: "Playlist deleted",
      message: `"${playlistName}" was removed.`,
      preset: "done",
    });
  };

  const handleCloseActionSheet = () => {
    setActionSheetType(null);
    setSelectedPlaylist(null);
  };

  const handleImportToEmptyPlaylist = () => {
    setActionSheetType(null);
    const targetPlaylist = selectedPlaylist;
    setSelectedPlaylist(null);
    if (targetPlaylist) {
      router.push("/import");
    }
  };

  const handleShowEmptyPlaylistActions = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActionSheetType("empty");
  };

  const actionTitle =
    actionSheetType === "delete"
      ? "Delete Playlist"
      : "⚠️ Playlist is empty";

  const actionMessage =
    actionSheetType === "delete"
      ? `Are you sure you want to delete "${selectedPlaylist?.name ?? ""}"?`
      : `"${selectedPlaylist?.name ?? ""}" has no tracks yet.`;

  const actionPrimaryLabel =
    actionSheetType === "delete" ? "Delete" : "Import Music";

  const actionPrimaryHandler =
    actionSheetType === "delete"
      ? handleConfirmDeletePlaylist
      : handleImportToEmptyPlaylist;

  const actionPrimaryButtonClassName =
    actionSheetType === "delete"
      ? "flex-1 rounded-xl py-3 items-center bg-red-500"
      : "flex-1 rounded-xl py-3 items-center bg-blue-500";

  const actionPrimaryTextClassName = "font-semibold text-white";

  const actionDescriptionClassName =
    colorScheme === "dark" ? "text-white/80 mt-1 text-sm" : "text-gray-900/80 mt-1 text-sm";

  const actionTitleClassName =
    colorScheme === "dark"
      ? "text-white text-lg font-semibold"
      : "text-gray-900 text-lg font-semibold";

  const actionGradientColors =
    colorScheme === "dark"
      ? (["#1f2937", "#111827", "#000000"] as const)
      : (["#f3f4f6", "#e5e7eb", "#ffffff"] as const);

  const handleOpenPlaylist = async (playlist: Playlist) => {
    const library = await storageService.getLibrary();
    const playlistTracks: Track[] = library.filter((track) =>
      playlist.trackIds.includes(track.id),
    );

    if (playlistTracks.length === 0) {
      handleShowEmptyPlaylistActions(playlist);
      return;
    }

    await controls.play(playlistTracks[0], playlistTracks);
    router.push("/player");
  };

  return (
    <ScreenGradient>
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Playlists
        </Text>
        <TouchableOpacity
          onPress={handleShowCreatePlaylistSheet}
          className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {playlists.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center mb-4">
              <Music size={32} color="#9CA3AF" />
            </View>
            <Text className="font-semibold mb-2 text-gray-900 dark:text-white">
              No playlists yet
            </Text>
            <Text
              variant="caption"
              className="text-gray-500 dark:text-gray-400 text-center"
            >
              Create your first playlist to organize your music
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                onPress={() => handleOpenPlaylist(playlist)}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 flex-row items-center"
                activeOpacity={0.7}
              >
                <View className="w-14 h-14 rounded-lg bg-purple-500 items-center justify-center mr-4">
                  <Music size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-semibold text-gray-900 dark:text-white"
                    numberOfLines={1}
                  >
                    {playlist.name}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    {playlist.trackIds.length} tracks
                  </Text>
                </View>
                {playlist.id !== FAVORITES_PLAYLIST_ID &&
                  playlist.name.trim().toLowerCase() !==
                    FAVORITES_PLAYLIST_NAME && (
                    <TouchableOpacity
                      onPress={(event) => {
                        event.stopPropagation();
                        handleRequestDeletePlaylist(playlist);
                      }}
                      className="p-2"
                    >
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TrueSheet
        ref={sheetRef}
        detents={["auto"]}
        cornerRadius={24}
        grabber
        dismissible
        dimmed
        onDidDismiss={handleCloseCreatePlaylistSheet}
        backgroundColor={colorScheme === "dark" ? "#111827" : "#FFFFFF"}
      >
        <View className="bg-white dark:bg-gray-800 overflow-hidden">
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["#1f2937", "#111827", "#000000"]
                : ["#f3f4f6", "#e5e7eb", "#ffffff"]
            }
            className="px-5 pb-4 pt-8"
          >
            <Text
              className={
                colorScheme === "dark"
                  ? "text-white text-lg font-semibold"
                  : "text-gray-900 text-lg font-semibold"
              }
            >
              Create Playlist
            </Text>
            <Text
              className={
                colorScheme === "dark"
                  ? "text-white/80 mt-1 text-sm"
                  : "text-gray-900/80 mt-1 text-sm"
              }
            >
              Give your playlist a name
            </Text>
          </LinearGradient>

          <View className="px-5 pt-4 pb-6">
            <TextInput
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              placeholder="My Playlist"
              placeholderTextColor={
                colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
              }
              className="rounded-xl px-4 py-3 border text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreatePlaylist}
            />

            <View className="flex-row mt-4 gap-3">
              <TouchableOpacity
                onPress={handleCloseCreatePlaylistSheet}
                className="flex-1 rounded-xl py-3 items-center bg-gray-200 dark:bg-gray-700"
                disabled={isCreatingPlaylist}
              >
                <Text className="font-semibold text-gray-800 dark:text-gray-200">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreatePlaylist}
                className="flex-1 rounded-xl py-3 items-center bg-blue-500"
                disabled={isCreatingPlaylist || !newPlaylistName.trim()}
                style={{
                  opacity:
                    isCreatingPlaylist || !newPlaylistName.trim() ? 0.6 : 1,
                }}
              >
                <Text className="font-semibold text-white">
                  {isCreatingPlaylist ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TrueSheet>

      <TrueSheet
        ref={actionSheetRef}
        detents={["auto"]}
        cornerRadius={24}
        grabber
        dismissible
        dimmed
        onDidDismiss={handleCloseActionSheet}
        backgroundColor={colorScheme === "dark" ? "#111827" : "#FFFFFF"}
      >
        <View className="bg-white dark:bg-gray-800 overflow-hidden">
          <LinearGradient
            colors={actionGradientColors}
            className="px-5 pb-4 pt-8"
          >
            <Text className={actionTitleClassName}>{actionTitle}</Text>
            <Text className={actionDescriptionClassName}>{actionMessage}</Text>
          </LinearGradient>

          <View className="px-5 pt-4 pb-6">
            <View className="flex-row mt-1 gap-3">
              <TouchableOpacity
                onPress={handleCloseActionSheet}
                className="flex-1 rounded-xl py-3 items-center bg-gray-200 dark:bg-gray-700"
              >
                <Text className="font-semibold text-gray-800 dark:text-gray-200">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={actionPrimaryHandler}
                className={actionPrimaryButtonClassName}
              >
                <Text className={actionPrimaryTextClassName}>
                  {actionPrimaryLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TrueSheet>
    </ScreenGradient>
  );
}
