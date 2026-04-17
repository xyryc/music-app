import { ScreenGradient } from "@/components/screen-gradient";
import { storageService } from "@/services/storage";
import { Playlist } from "@/types/playlist";
import { useFocusEffect } from "expo-router";
import { Music, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const FAVORITES_PLAYLIST_ID = "favorites";
const FAVORITES_PLAYLIST_NAME = "favorites";

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const loadPlaylists = useCallback(async () => {
    const data = await storageService.getPlaylists();
    setPlaylists(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, [loadPlaylists]),
  );

  const handleCreatePlaylist = () => {
    Alert.prompt(
      "New Playlist",
      "Enter playlist name",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: (name: string | undefined) => {
            if (!name || !name.trim()) return;

            const newPlaylist: Playlist = {
              id: `${Date.now()}`,
              name: name.trim(),
              trackIds: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            storageService.createPlaylist(newPlaylist);
            loadPlaylists();
          },
        },
      ],
      "plain-text",
      "My Playlist",
    );
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    Alert.alert(
      "Delete Playlist",
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await storageService.deletePlaylist(playlist.id);
            loadPlaylists();
          },
        },
      ],
    );
  };

  return (
    <ScreenGradient>
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Playlists</Text>
        <TouchableOpacity
          onPress={handleCreatePlaylist}
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
            <Text className="font-semibold mb-2 text-gray-900 dark:text-white">No playlists yet</Text>
            <Text variant="caption" className="text-gray-500 dark:text-gray-400 text-center">
              Create your first playlist to organize your music
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {playlists.map((playlist) => (
              <View
                key={playlist.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 flex-row items-center"
              >
                <View className="w-14 h-14 rounded-lg bg-purple-500 items-center justify-center mr-4">
                  <Music size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text variant="caption" className="text-gray-500">
                    {playlist.trackIds.length} tracks
                  </Text>
                </View>
                {playlist.id !== FAVORITES_PLAYLIST_ID &&
                  playlist.name.trim().toLowerCase() !== FAVORITES_PLAYLIST_NAME && (
                    <TouchableOpacity
                      onPress={() => handleDeletePlaylist(playlist)}
                      className="p-2"
                    >
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenGradient>
  );
}
