import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/hooks/use-player";
import { Play, Pause, Music } from "lucide-react-native";

interface MiniPlayerProps {
  onPress: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const { state, controls } = usePlayer();

  if (!state.currentTrack) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg"
    >
      <View className="flex-row items-center">
        {/* Track Icon */}
        <View className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center mr-4">
          <Music size={20} color="#FFFFFF" />
        </View>

        {/* Track Info */}
        <View className="flex-1">
          <StyledText weight="semibold" numberOfLines={1}>
            {state.currentTrack.title}
          </StyledText>
          <StyledText variant="caption" className="text-gray-500" numberOfLines={1}>
            {state.currentTrack.artist || "Unknown Artist"}
          </StyledText>
        </View>

        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            controls.togglePlayPause();
          }}
          className="w-10 h-10 items-center justify-center"
        >
          {state.isPlaying ? (
            <Pause size={24} color="#0A7EA4" />
          ) : (
            <Play size={24} color="#0A7EA4" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-blue-500 rounded-full"
          style={{
            width: `${
              state.duration > 0
                ? (state.position / state.duration) * 100
                : 0
            }%`,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
