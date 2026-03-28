import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/contexts/player-provider";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Music, Pause, Play } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "nativewind";

interface MiniPlayerProps {
  onPress: () => void;
}

export function MiniPlayer({ onPress }: MiniPlayerProps) {
  const { state, controls } = usePlayer();
  const { colorScheme } = useColorScheme();

  if (!state.currentTrack) return null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 shadow-lg"
    >
      <View className="flex-row items-center">
        {/* Track Cover / Placeholder */}
        {state.currentTrack.coverArt ? (
          <Image
            source={{ uri: state.currentTrack.coverArt }}
            placeholder={state.currentTrack.coverArtBlurhash}
            className="w-12 h-12 rounded-lg mr-4"
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={["#3B82F6", "#9333EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-12 h-12 rounded-lg mr-4 items-center justify-center"
          >
            <Music size={20} color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} />
          </LinearGradient>
        )}

        {/* Track Info */}
        <View className="flex-1">
          <StyledText weight="semibold" numberOfLines={1}>
            {state.currentTrack.title}
          </StyledText>
          <StyledText
            variant="caption"
            className="text-gray-500 dark:text-gray-400"
            numberOfLines={1}
          >
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
            <Pause size={24} color={colorScheme === "dark" ? "#0A7EA4" : "#000000"} />
          ) : (
            <Play size={24} color={colorScheme === "dark" ? "#0A7EA4" : "#000000"} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-blue-500 rounded-full"
          style={{
            width: `${
              state.duration > 0 ? (state.position / state.duration) * 100 : 0
            }%`,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
