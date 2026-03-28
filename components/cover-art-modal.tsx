import React, { useState, useEffect } from "react";
import { View, Modal, TouchableOpacity, Alert, Image } from "react-native";
import { StyledText } from "@/components/styled-text";
import { Track } from "@/types/track";
import { CoverArtResult, CoverArtService } from "@/services/cover-art";
import { ChevronLeft, Download, Image as ImageIcon, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

interface CoverArtModalProps {
  isVisible: boolean;
  track: Track | null;
  onClose: () => void;
  onCoverSelected: (coverUrl: string) => void;
}

export function CoverArtModal({ isVisible, track, onClose, onCoverSelected }: CoverArtModalProps) {
  const [searchResults, setSearchResults] = useState<CoverArtResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();

  const coverArtService = CoverArtService.getInstance();

  useEffect(() => {
    if (isVisible && track) {
      loadCoverArt();
    }
  }, [isVisible, track]);

  const loadCoverArt = async () => {
    if (!track) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const result = await coverArtService.searchCoverArt(track);

      if (result && result.images.length > 0) {
        setSearchResults(result.images);
      } else {
        setError("No cover art found for this track");
      }
    } catch (err) {
      console.error("Cover art search error:", err);
      setError("Failed to search for cover art");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverSelect = (cover: CoverArtResult) => {
    Alert.alert(
      "Select Cover Art",
      "Do you want to use this cover art for this track?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Select",
          onPress: () => {
            onCoverSelected(cover.url);
            onClose();
          }
        }
      ]
    );
  };

  const renderCoverGrid = () => {
    if (!searchResults) return null;

    return (
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
          <StyledText weight="semibold" className="text-white text-lg">
            Cover Art Options
          </StyledText>
          <StyledText variant="caption" className="text-gray-400">
            {searchResults.length} found
          </StyledText>
        </View>

        <View className="flex-1 p-4">
          <View className="flex-1">
            <View className="grid grid-cols-2 gap-4">
              {searchResults.map((cover) => (
                <TouchableOpacity
                  key={cover.id}
                  onPress={() => handleCoverSelect(cover)}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
                >
                  <View className="aspect-square relative">
                    <Image
                      source={{ uri: cover.url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(0,0,0,0.8)"]}
                      className="absolute bottom-0 left-0 right-0 p-2"
                    >
                      <View className="flex-row items-center justify-between">
                        <StyledText variant="caption" className="text-white text-xs" numberOfLines={1}>
                          {cover.width}x{cover.height}
                        </StyledText>
                        {cover.front && (
                          <StyledText variant="caption" className="text-blue-400 text-xs bg-blue-900 px-1 rounded">
                            Front
                          </StyledText>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <View className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
      <StyledText className={colorScheme === "dark" ? "text-gray-400 mt-4" : "text-gray-600 mt-4"}>Searching for cover art...</StyledText>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center">
      <ImageIcon size={64} color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"} />
      <StyledText className={colorScheme === "dark" ? "text-gray-400 mt-4 text-center px-8" : "text-gray-600 mt-4 text-center px-8"}>
        {error}
      </StyledText>
      <TouchableOpacity
        onPress={loadCoverArt}
        className="bg-blue-600 px-6 py-2 rounded-full mt-6"
      >
        <StyledText className={colorScheme === "dark" ? "text-white" : "text-black"}>Try Again</StyledText>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center">
      <ImageIcon size={64} color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"} />
      <StyledText className={colorScheme === "dark" ? "text-gray-400 mt-4 text-center px-8" : "text-gray-600 mt-4 text-center px-8"}>
        No cover art found for this track. Try searching with a different title or artist.
      </StyledText>
    </View>
  );

  if (!track) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1f2937", "#111827", "#000000"]
            : ["#f3f4f6", "#e5e7eb", "#ffffff"]
        }
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <View className="items-center">
            <StyledText weight="semibold" className={colorScheme === "dark" ? "text-white text-lg" : "text-black text-lg"}>
              {track.title}
            </StyledText>
            <StyledText variant="caption" className={colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}>
              {track.artist || "Unknown Artist"}
            </StyledText>
          </View>
          <TouchableOpacity onPress={loadCoverArt} disabled={isLoading} className="p-2">
            <Download size={24} color={isLoading ? (colorScheme === "dark" ? "#6B7280" : "#9CA3AF") : (colorScheme === "dark" ? "#FFFFFF" : "#000000")} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? renderLoading() :
         error ? renderError() :
         searchResults && searchResults.length > 0 ? renderCoverGrid() :
         renderEmpty()}
      </LinearGradient>
    </Modal>
  );
}