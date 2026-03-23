import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/hooks/use-player";
import { RepeatMode } from "@/types/player";
import { Track } from "@/types/track";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronDown,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

interface NowPlayingScreenProps {
  onMinimize: () => void;
  initialTrack?: Track;
}

export function NowPlayingScreen({
  onMinimize,
  initialTrack,
}: NowPlayingScreenProps) {
  const { state, controls } = usePlayer();
  const [localPosition, setLocalPosition] = useState(0);

  // Use state.currentTrack as the source of truth, fall back to initialTrack
  const currentTrack = state.currentTrack || initialTrack;

  useEffect(() => {
    setLocalPosition(currentTrack ? state.position : 0);
  }, [state.position, currentTrack]);

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

  const handlePlayPause = async () => {
    console.log("=== handlePlayPause ===");
    await controls.togglePlayPause();
  };

  const handleRepeatPress = () => {
    const modes: RepeatMode[] = ["off", "all", "one"];
    const currentIndex = modes.indexOf(state.repeatMode);
    controls.setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  if (!currentTrack) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111827" }} className="items-center justify-center">
        <StyledText className="text-white text-lg">No track playing</StyledText>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#1f2937", "#111827", "#000000"]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 mt-8">
          <TouchableOpacity onPress={onMinimize} className="p-2">
            <ChevronDown size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <StyledText weight="semibold" className="text-white text-sm">
            NOW PLAYING
          </StyledText>
          <TouchableOpacity className="p-2">
            <ListMusic size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Album Art */}
        <View className="flex-1 items-center justify-center px-8">
          <LinearGradient
            colors={["#3b82f6", "#9333ea"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-72 h-72 rounded-3xl items-center justify-center shadow-2xl overflow-hidden"
          >
            {currentTrack.coverArt ? (
              <Image
                source={{ uri: currentTrack.coverArt }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center justify-center">
                <Volume2 size={80} color="#FFFFFF" opacity={0.5} />
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Track Info */}
        <View className="px-8 mb-10">
          <View className="mb-8">
            <StyledText
              variant="title"
              weight="bold"
              className="text-white text-2xl mb-2"
              numberOfLines={1}
            >
              {currentTrack.title}
            </StyledText>
            <StyledText className="text-gray-400 text-lg" numberOfLines={1}>
              {currentTrack.artist || "Unknown Artist"}
            </StyledText>
          </View>

          {/* Progress Bar */}
          <View className="mb-8">
            <Slider
              value={localPosition / 1000}
              minimumValue={0}
              maximumValue={state.duration / 1000 || 100}
              onValueChange={handleSeek}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#4B5563"
              thumbTintColor="#FFFFFF"
              className="h-10"
            />
            <View className="flex-row justify-between mt-1">
              <StyledText variant="caption" className="text-gray-500 font-medium">
                {formatTime(localPosition)}
              </StyledText>
              <StyledText variant="caption" className="text-gray-500 font-medium">
                {formatTime(state.duration)}
              </StyledText>
            </View>
          </View>

          {/* Controls */}
          <View className="flex-row items-center justify-between px-2 mb-10">
            <TouchableOpacity onPress={controls.toggleShuffle}>
              <Shuffle
                size={22}
                color={state.isShuffled ? "#3b82f6" : "#9CA3AF"}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={controls.playPrevious}>
              <SkipBack size={36} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayPause}
              className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-lg"
            >
              {state.isPlaying ? (
                <Pause size={36} color="#000000" />
              ) : (
                <Play size={36} color="#000000" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={controls.playNext}>
              <SkipForward size={36} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRepeatPress}>
              <Repeat
                size={22}
                color={state.repeatMode !== "off" ? "#3b82f6" : "#9CA3AF"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
