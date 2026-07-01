import { Track } from "@/types/track";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Music } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TrackItemProps {
  track: Track;
  onPress: () => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  isPlaying?: boolean;
}

export function TrackItem({
  track,
  onPress,
  onLongPress,
  isPlaying,
}: TrackItemProps) {
  const { colorScheme } = useColorScheme();
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
    >
      {/* Track Cover / Placeholder */}
      {track.coverArt ? (
        <Image
          source={{ uri: track.coverArt }}
          placeholder={track.coverArtBlurhash}
          style={{ width: 48, height: 48, borderRadius: 8, marginRight: 16 }}
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
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            marginRight: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Music
            size={20}
            color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
          />
        </LinearGradient>
      )}

      {/* Track Info */}
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={
            isPlaying
              ? "text-base font-semibold text-blue-500"
              : "text-base font-medium text-gray-900 dark:text-white"
          }
        >
          {track.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {track.artist || "Unknown Artist"}
        </Text>
      </View>

      {/* Duration */}
      <View className="items-center mr-3">
        <Text
          className={
            colorScheme === "dark"
              ? "text-sm text-gray-300"
              : "text-sm text-gray-600"
          }
        >
          {formatDuration(track.duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
