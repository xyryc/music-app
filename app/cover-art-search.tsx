import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, FlatList, Text } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Track } from "@/types/track";
import { CoverArtResult, CoverArtService } from "@/services/cover-art";
import { ChevronLeft, Image as ImageIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { useCoverArt } from "@/contexts/cover-art-context";
import { useColorScheme } from "nativewind";
import { toast } from "@baronha/ting";

export default function CoverArtSearchScreen() {
  const { track } = useLocalSearchParams();
  const { setCoverSelection } = useCoverArt();
  const { colorScheme } = useColorScheme();
  const [searchResults, setSearchResults] = useState<CoverArtResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let trackObj: Track | null = null;
  try {
    trackObj = track ? JSON.parse(track as string) : null;
  } catch (e) {
    console.error("Failed to parse track:", e);
  }

  const coverArtService = CoverArtService.getInstance();

  useEffect(() => {
    setSearchResults(null);
    setError(null);

    if (!trackObj) {
      return;
    }

    loadCoverArt(trackObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  const loadCoverArt = async (currentTrack?: Track | null) => {
    if (!currentTrack) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const result = await coverArtService.searchCoverArt(currentTrack);

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
    if (trackObj) {
      setCoverSelection(trackObj.id, cover.url);
      toast({
        title: "Cover Art Updated",
        preset: "done",
      });
      router.back();
    }
  };

  const renderCoverItem = ({ item }: { item: CoverArtResult }) => (
    <TouchableOpacity
      onPress={() => handleCoverSelect(item)}
      className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 m-2"
      style={{ width: "48%" }}
    >
      <View className="aspect-square relative">
        <Image
          source={{ uri: item.url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          className="absolute bottom-0 left-0 right-0 p-2"
        >
          <View className="flex-row items-center justify-between">
            <Text variant="caption" className="text-white text-xs" numberOfLines={1}>
              {item.width}x{item.height}
            </Text>
            {item.front && (
              <Text variant="caption" className={colorScheme === "dark" ? "text-blue-400 text-xs bg-blue-900 px-1 rounded" : "text-blue-600 text-xs bg-blue-100 px-1 rounded"}>
                Front
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <View className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
      <Text className={colorScheme === "dark" ? "text-gray-400 mt-4" : "text-gray-600 mt-4"}>Searching for cover art...</Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center">
      <ImageIcon size={64} color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"} />
      <Text className={colorScheme === "dark" ? "text-gray-400 mt-4 text-center px-8" : "text-gray-600 mt-4 text-center px-8"}>
        {error}
      </Text>
      <TouchableOpacity
        onPress={() => loadCoverArt(trackObj)}
        className="bg-blue-600 px-6 py-2 rounded-full mt-6"
      >
        <Text className={colorScheme === "dark" ? "text-white" : "text-black"}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center">
      <ImageIcon size={64} color={colorScheme === "dark" ? "#6B7280" : "#9CA3AF"} />
      <Text className={colorScheme === "dark" ? "text-gray-400 mt-4 text-center px-8" : "text-gray-600 mt-4 text-center px-8"}>
        No cover art found for this track. Try searching with a different title or artist.
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? ["#1f2937", "#111827", "#000000"]
          : ["#f3f4f6", "#e5e7eb", "#ffffff"]
      }
      className="flex-1"
    >
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-700">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <ChevronLeft size={24} color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className={colorScheme === "dark" ? "text-white text-lg font-semibold" : "text-black text-lg font-semibold"} numberOfLines={1}>
              {trackObj?.title || ""}
            </Text>
            <Text variant="caption" className={colorScheme === "dark" ? "text-gray-400" : "text-gray-600"} numberOfLines={1}>
              {trackObj?.artist || "Unknown Artist"}
            </Text>
          </View>
        </View>

        {/* Content */}
        {isLoading ? renderLoading() :
         error ? renderError() :
         searchResults && searchResults.length > 0 ? (
           <FlatList
             data={searchResults}
             renderItem={renderCoverItem}
             keyExtractor={(item) => item.id}
             numColumns={2}
             contentContainerStyle={{ padding: 8 }}
             ListHeaderComponent={
               <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                 <Text className={colorScheme === "dark" ? "text-white text-lg font-semibold" : "text-black text-lg font-semibold"}>
                   Cover Art Options
                 </Text>
                 <Text variant="caption" className={colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                   {searchResults.length} found
                 </Text>
               </View>
             }
           />
         ) : renderEmpty()}
      </SafeAreaView>
    </LinearGradient>
  );
}