import { View, TouchableOpacity } from "react-native";
import { StyledText } from "@/components/styled-text";
import { Track } from "@/types/track";
import { Music, MoreVertical } from "lucide-react-native";

interface TrackItemProps {
  track: Track;
  onPress: () => void;
  onMorePress?: () => void;
  isPlaying?: boolean;
}

export function TrackItem({ track, onPress, onMorePress, isPlaying }: TrackItemProps) {
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
      {/* Track Icon / Cover */}
      <View className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center mr-4">
        <Music size={20} color="#FFFFFF" />
      </View>

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
