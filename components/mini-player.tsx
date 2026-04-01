import { usePlayer } from "@/contexts/player-provider";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Music, Pause, Play, SkipBack, SkipForward } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "nativewind";

interface MiniPlayerProps {
  onPress: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const { state, controls } = usePlayer();
  const { colorScheme } = useColorScheme();

  if (!state.currentTrack) return null;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg"
    >
      <View className="h-1 bg-gray-200 dark:bg-gray-800 w-full">
        <View
          className="h-full bg-blue-500"
          style={{
            width: `${
              state.duration > 0 ? (state.position / state.duration) * 100 : 0
            }%`,
          }}
        />
      </View>

      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {state.currentTrack.coverArt ? (
            <Image
              source={{ uri: state.currentTrack.coverArt }}
              placeholder={state.currentTrack.coverArtBlurhash}
              style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#1f2937", "#111827", "#000000"]
                  : ["#f3f4f6", "#e5e7eb", "#ffffff"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="items-center justify-center"
              style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }}
            >
              <Music size={20} color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} />
            </LinearGradient>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-semibold"
          >
            {state.currentTrack.title}
          </Text>
          <Text
            numberOfLines={1}
            className={colorScheme === "dark"
              ? "text-sm text-gray-300"
              : "text-sm text-gray-600"
            }
          >
            {state.currentTrack.artist || "Unknown Artist"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center ml-2">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              controls.playPrevious();
            }}
            className="w-10 h-10 items-center justify-center mr-1"
          >
            <SkipBack size={22} color={colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              controls.togglePlayPause();
            }}
            className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-1"
          >
            {state.isPlaying ? (
              <Pause size={22} color="#FFFFFF" />
            ) : (
              <Play size={22} color="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              controls.playNext();
            }}
            className="w-10 h-10 items-center justify-center"
          >
            <SkipForward size={22} color={colorScheme === "dark" ? "#FFFFFF" : "#1A1A1A"} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between px-4 pb-2">
        <Text className={colorScheme === "dark"
          ? "text-sm text-gray-300"
          : "text-sm text-gray-600"
        }>
          {formatTime(state.position)}
        </Text>
        <Text className={colorScheme === "dark"
          ? "text-sm text-gray-300"
          : "text-sm text-gray-600"
        }>
          {formatTime(state.duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
