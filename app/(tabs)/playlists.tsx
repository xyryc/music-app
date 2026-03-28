import { ScreenGradient } from "@/components/screen-gradient";
import { StyledText } from "@/components/styled-text";
import { storageService } from "@/services/storage";
import { Playlist } from "@/types/playlist";
import { Music, Plus, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const loadPlaylists = useCallback(async () => {
    const data = await storageService.getPlaylists();
    setPlaylists(data);
  }, []);

  useState(() => {
    loadPlaylists();
  });

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
        <StyledText variant="title" weight="bold">
          Playlists
        </StyledText>
        <TouchableOpacity
          onPress={handleCreatePlaylist}
          className="flex-row items-center bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Plus size={20} color="#FFFFFF" />
          <StyledText className="text-white font-semibold ml-2">New</StyledText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {playlists.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <View className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center mb-4">
              <Music size={32} color="#9CA3AF" />
            </View>
            <StyledText weight="semibold" className="mb-2">
              No playlists yet
            </StyledText>
            <StyledText variant="caption" className="text-gray-500 dark:text-gray-400 text-center">
              Create your first playlist to organize your music
            </StyledText>
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
                  <StyledText weight="semibold" numberOfLines={1}>
                    {playlist.name}
                  </StyledText>
                  <StyledText variant="caption" className="text-gray-500">
                    {playlist.trackIds.length} tracks
                  </StyledText>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePlaylist(playlist)}
                  className="p-2"
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenGradient>
  );
}
