import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/hooks/use-player";
import { RepeatMode } from "@/types/player";
import Slider from "@react-native-community/slider";
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

interface NowPlayingScreenProps {
  onClose: () => void;
}

export function NowPlayingScreen({ onClose }: NowPlayingScreenProps) {
  const { state, controls } = usePlayer();
  const [localPosition, setLocalPosition] = useState(0);

  useEffect(() => {
    setLocalPosition(state.position);
  }, [state.position]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number) => {
    const positionMs = value * 1000;
    controls.seek(positionMs);
    setLocalPosition(positionMs);
  };

  if (!state.currentTrack) return null;

  return (
    <View className="flex-1 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4">
        <TouchableOpacity onPress={onClose} className="p-2">
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <StyledText weight="semibold" className="text-white">
          NOW PLAYING
        </StyledText>
        <TouchableOpacity className="p-2">
          <ListMusic size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-72 h-72 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center shadow-2xl">
          {state.currentTrack.coverArt ? (
            <Image
              source={{ uri: state.currentTrack.coverArt }}
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <Volume2 size={80} color="#FFFFFF" opacity={0.5} />
          )}
        </View>
      </View>

      {/* Track Info */}
      <View className="px-8 mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1">
            <StyledText
              variant="title"
              weight="bold"
              className="text-white text-xl"
              numberOfLines={1}
            >
              {state.currentTrack.title}
            </StyledText>
            <StyledText className="text-gray-400" numberOfLines={1}>
              {state.currentTrack.artist || "Unknown Artist"}
            </StyledText>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mt-6">
          <Slider
            value={localPosition / 1000}
            minimumValue={0}
            maximumValue={state.duration / 1000 || 100}
            onValueChange={handleSeek}
            minimumTrackTintColor="#0A7EA4"
            maximumTrackTintColor="#4B5563"
            thumbTintColor="#0A7EA4"
            className="h-12"
          />
          <View className="flex-row justify-between mt-2">
            <StyledText variant="caption" className="text-gray-400">
              {formatTime(localPosition)}
            </StyledText>
            <StyledText variant="caption" className="text-gray-400">
              {formatTime(state.duration)}
            </StyledText>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center mt-6 gap-8">
          <TouchableOpacity
            onPress={controls.toggleShuffle}
            className={`p-3 ${state.isShuffled ? "text-blue-500" : ""}`}
          >
            <Shuffle
              size={24}
              color={state.isShuffled ? "#0A7EA4" : "#9CA3AF"}
              fill={state.isShuffled ? "#0A7EA4" : "none"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={controls.playPrevious} className="p-3">
            <SkipBack size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={controls.togglePlayPause}
            className="w-20 h-20 rounded-full bg-white items-center justify-center"
          >
            {state.isPlaying ? (
              <Pause size={36} color="#1A1A1A" />
            ) : (
              <Play size={36} color="#1A1A1A" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={controls.playNext} className="p-3">
            <SkipForward size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const modes: RepeatMode[] = ["off", "all", "one"];
              const currentIndex = modes.indexOf(state.repeatMode);
              controls.setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className="p-3"
          >
            <Repeat
              size={24}
              color={state.repeatMode !== "off" ? "#0A7EA4" : "#9CA3AF"}
              fill={state.repeatMode !== "off" ? "#0A7EA4" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
