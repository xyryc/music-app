import { ScreenGradient } from "@/components/screen-gradient";
import { usePlayer } from "@/contexts/player-provider";
import { parseFilenameMetadata } from "@/services/track-metadata";
import { storageService } from "@/services/storage";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { toast } from "@baronha/ting";
import { createAudioPlayer } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import {
  copyAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { Music, Plus } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
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
  const [isImportingToPlaylist, setIsImportingToPlaylist] = useState(false);
  const [isPlaylistActionsVisible, setIsPlaylistActionsVisible] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);

  const trackById = useMemo(() => {
    return new Map(libraryTracks.map((track) => [track.id, track]));
  }, [libraryTracks]);

  const playlistCoverArtById = useMemo(() => {
    const coverArtMap = new Map<string, string>();

    for (const playlist of playlists) {
      let coverArtUri: string | undefined;

      for (const trackId of playlist.trackIds) {
        const track = trackById.get(trackId);
        if (track?.coverArt) {
          coverArtUri = track.coverArt;
          break;
        }
      }

      if (coverArtUri) {
        coverArtMap.set(playlist.id, coverArtUri);
      }
    }

    return coverArtMap;
  }, [playlists, trackById]);

  useEffect(() => {
    const syncSheet = async () => {
      if (!sheetRef.current) {
        return;
      }

      try {
        if (isCreateSheetVisible) {
          await sheetRef.current.present();
        } else {
          await sheetRef.current.dismiss();
        }
      } catch {
        // Ignore transient TrueSheet lifecycle errors during rapid mount/unmount.
      }
    };

    void syncSheet();
  }, [isCreateSheetVisible]);

  useEffect(() => {
    const syncActionSheet = async () => {
      if (!actionSheetRef.current) {
        return;
      }

      try {
        if (isPlaylistActionsVisible) {
          await actionSheetRef.current.present();
        } else {
          await actionSheetRef.current.dismiss();
        }
      } catch {
        // Ignore transient TrueSheet lifecycle errors during rapid mount/unmount.
      }
    };

    void syncActionSheet();
  }, [isPlaylistActionsVisible]);

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

  const loadLibraryTracks = useCallback(async () => {
    const library = await storageService.getLibrary();
    setLibraryTracks(library);
  }, []);

  const loadScreenData = useCallback(async () => {
    await Promise.all([loadPlaylists(), loadLibraryTracks()]);
  }, [loadPlaylists, loadLibraryTracks]);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  };

  const getDurationFromUri = async (uri: string): Promise<number> => {
    try {
      const player = createAudioPlayer({ uri }, { downloadFirst: false });
      const startedAt = Date.now();
      const timeoutMs = 5000;

      while (Date.now() - startedAt < timeoutMs) {
        if (player.isLoaded) {
          const duration = Math.round(player.duration * 1000) || 0;
          player.remove();
          return duration;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      player.remove();
      return 0;
    } catch (error) {
      console.error("Error getting duration:", error);
      return 0;
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadScreenData();
    }, [loadScreenData]),
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
      await loadScreenData();
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

  const handleShowPlaylistActions = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsPlaylistActionsVisible(true);
  };

  const handleCloseActionSheet = () => {
    setIsPlaylistActionsVisible(false);
    setSelectedPlaylist(null);
  };

  const handleConfirmDeletePlaylist = async () => {
    if (!selectedPlaylist) {
      return;
    }

    const playlistName = selectedPlaylist.name;
    await storageService.deletePlaylist(selectedPlaylist.id);
    await loadScreenData();
    handleCloseActionSheet();
    toast({
      title: "Playlist deleted",
      message: `"${playlistName}" was removed.`,
      preset: "done",
    });
  };

  const handleImportToPlaylist = async () => {
    if (!selectedPlaylist || isImportingToPlaylist) {
      return;
    }

    try {
      setIsImportingToPlaylist(true);

      const targetPlaylist = selectedPlaylist;
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const tracksDir = `${documentDirectory}tracks/`;
      const dirInfo = await getInfoAsync(tracksDir);
      if (!dirInfo.exists) {
        await makeDirectoryAsync(tracksDir, { intermediates: true });
      }

      const importedTrackIds: string[] = [];

      for (const asset of result.assets) {
        const assetInfo = await getInfoAsync(asset.uri);
        if (!assetInfo.exists) {
          console.error("Source file does not exist:", asset.uri);
          continue;
        }

        const fileExt = asset.name.split(".").pop() || "mp3";
        const fileName = `${generateId()}.${fileExt}`;
        const permanentUri = `${tracksDir}${fileName}`;

        await copyAsync({ from: asset.uri, to: permanentUri });

        const checkInfo = await getInfoAsync(permanentUri);
        if (!checkInfo.exists || checkInfo.size === 0) {
          console.error("Failed to copy file or file is empty:", permanentUri);
          continue;
        }

        const duration = await getDurationFromUri(permanentUri);
        const filenameMetadata = parseFilenameMetadata(asset.name);

        const track: Track = {
          id: generateId(),
          title:
            filenameMetadata.title ||
            asset.name.replace(/\.[^/.]+$/, "") ||
            "Unknown Track",
          artist: filenameMetadata.artist,
          uri: permanentUri,
          source: "local",
          duration,
          dateAdded: Date.now(),
          playCount: 0,
        };

        await storageService.addToLibrary(track);
        importedTrackIds.push(track.id);
      }

      if (importedTrackIds.length === 0) {
        toast({
          title: "No tracks imported",
          message: "Could not import selected files.",
          preset: "error",
        });
        return;
      }

      const mergedTrackIds = Array.from(
        new Set([...targetPlaylist.trackIds, ...importedTrackIds]),
      );

      await storageService.updatePlaylist({
        ...targetPlaylist,
        trackIds: mergedTrackIds,
        updatedAt: Date.now(),
      });

      await loadScreenData();
      handleCloseActionSheet();
      toast({
        title: "Tracks imported",
        message: `${importedTrackIds.length} track(s) added to "${targetPlaylist.name}".`,
        preset: "done",
      });
    } catch (error) {
      console.error("Error importing to playlist:", error);
      toast({
        title: "Error",
        message: "Failed to import track. Please try again.",
        preset: "error",
      });
    } finally {
      setIsImportingToPlaylist(false);
    }
  };

  const actionTitleClassName =
    colorScheme === "dark"
      ? "text-white text-lg font-semibold"
      : "text-gray-900 text-lg font-semibold";

  const actionDescriptionClassName =
    colorScheme === "dark"
      ? "text-white/80 mt-1 text-sm"
      : "text-gray-900/80 mt-1 text-sm";

  const actionGradientColors =
    colorScheme === "dark"
      ? (["#1f2937", "#111827", "#000000"] as const)
      : (["#f3f4f6", "#e5e7eb", "#ffffff"] as const);

  const importButtonLabel = isImportingToPlaylist ? "Importing..." : "Import Music";
  const handleOpenPlaylist = async (playlist: Playlist) => {
    const library = await storageService.getLibrary();
    const playlistTracks: Track[] = library.filter((track) =>
      playlist.trackIds.includes(track.id),
    );

    if (playlistTracks.length === 0) {
      handleShowPlaylistActions(playlist);
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
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              Create your first playlist to organize your music
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {playlists.map((playlist) => {
              const coverArtUri = playlistCoverArtById.get(playlist.id);

              return (
                <TouchableOpacity
                  key={playlist.id}
                  onPress={() => handleOpenPlaylist(playlist)}
                  onLongPress={() => handleShowPlaylistActions(playlist)}
                  className="bg-white dark:bg-gray-900 rounded-xl p-4 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <View className="w-14 h-14 rounded-lg bg-purple-500 items-center justify-center mr-4 overflow-hidden">
                    {coverArtUri ? (
                      <Image
                        source={{ uri: coverArtUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Music size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-semibold text-gray-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {playlist.name}
                    </Text>
                    <Text className="text-gray-500">
                      {playlist.trackIds.length} tracks
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
            <Text className={actionTitleClassName}>Playlist Actions</Text>
            <Text className={actionDescriptionClassName}>
              {selectedPlaylist ? `"${selectedPlaylist.name}"` : ""}
            </Text>
          </LinearGradient>

          <View className="px-5 pt-4 pb-6 gap-3">
            <TouchableOpacity
              onPress={handleImportToPlaylist}
              className="rounded-xl py-3 items-center bg-blue-500"
              disabled={isImportingToPlaylist}
              style={{ opacity: isImportingToPlaylist ? 0.6 : 1 }}
            >
              <Text className="font-semibold text-white">{importButtonLabel}</Text>
            </TouchableOpacity>

            {selectedPlaylist?.id !== FAVORITES_PLAYLIST_ID &&
              selectedPlaylist?.name.trim().toLowerCase() !==
                FAVORITES_PLAYLIST_NAME && (
                <TouchableOpacity
                  onPress={handleConfirmDeletePlaylist}
                  className="rounded-xl py-3 items-center bg-red-500"
                >
                  <Text className="font-semibold text-white">Delete Playlist</Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity
              onPress={handleCloseActionSheet}
              className="rounded-xl py-3 items-center bg-gray-200 dark:bg-gray-700"
            >
              <Text className="font-semibold text-gray-800 dark:text-gray-200">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TrueSheet>
    </ScreenGradient>
  );
}
