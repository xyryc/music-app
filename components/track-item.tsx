import { StyledText } from "@/components/styled-text";
import { Track } from "@/types/track";
import { LinearGradient } from "expo-linear-gradient";
import { MoreVertical, Music } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";

interface TrackItemProps {
  track: Track;
  onPress: () => void;
  onMorePress?: () => void;
  isPlaying?: boolean;
}

export function TrackItem({
  track,
  onPress,
  onMorePress,
  isPlaying,
}: TrackItemProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100"
    >
      {/* Track Cover / Placeholder */}
      {track.coverArt ? (
        <Image
          source={{ uri: track.coverArt }}
          className="w-12 h-12 rounded-lg mr-4"
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={["#3B82F6", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-12 h-12 rounded-lg mr-4 items-center justify-center"
        >
          <Music size={20} color="#FFFFFF" />
        </LinearGradient>
      )}

      {/* Track Info */}
      <View className="flex-1">
        <StyledText
          weight={isPlaying ? "semibold" : "medium"}
          className={isPlaying ? "text-blue-500" : ""}
          numberOfLines={1}
        >
          {track.title}
        </StyledText>
        <StyledText variant="caption" numberOfLines={1}>
          {track.artist || "Unknown Artist"}
        </StyledText>
      </View>

      {/* Duration */}
      <View className="items-center mr-3">
        <StyledText variant="caption" className="text-gray-400">
          {formatDuration(track.duration)}
        </StyledText>
      </View>

      {/* More Button */}
      {onMorePress && (
        <TouchableOpacity onPress={onMorePress} className="p-2">
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
