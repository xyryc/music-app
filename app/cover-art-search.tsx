import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyledText } from "@/components/styled-text";
import { Track } from "@/types/track";
import { CoverArtResult, CoverArtService } from "@/services/cover-art";
import { ChevronLeft, Image as ImageIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCoverArt } from "@/contexts/cover-art-context";

export default function CoverArtSearchScreen() {
  const { track } = useLocalSearchParams();
  const { setCoverSelection } = useCoverArt();
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
  const navigation = useNavigation();

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
            // Handle the cover selection
            if (trackObj) {
              // Use the context to pass the selection back to the parent
              setCoverSelection(trackObj.id, cover.url);
              console.log("Selected cover:", cover.url);

              // Navigate back
              navigation.goBack();
            }
          }
        }
      ]
    );
  };

  const renderCoverItem = ({ item }: { item: CoverArtResult }) => (
    <TouchableOpacity
      onPress={() => handleCoverSelect(item)}
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 m-2"
      style={{ width: "48%" }}
    >
      <View className="aspect-square relative">
        <Image
          source={{ uri: item.url }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          className="absolute bottom-0 left-0 right-0 p-2"
        >
          <View className="flex-row items-center justify-between">
            <StyledText variant="caption" className="text-white text-xs" numberOfLines={1}>
              {item.width}x{item.height}
            </StyledText>
            {item.front && (
              <StyledText variant="caption" className="text-blue-400 text-xs bg-blue-900 px-1 rounded">
                Front
              </StyledText>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <View className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
      <StyledText className="text-gray-400 mt-4">Searching for cover art...</StyledText>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center">
      <ImageIcon size={64} color="#6B7280" />
      <StyledText className="text-gray-400 mt-4 text-center px-8">
        {error}
      </StyledText>
      <TouchableOpacity
        onPress={() => loadCoverArt(trackObj)}
        className="bg-blue-600 px-6 py-2 rounded-full mt-6"
      >
        <StyledText className="text-white">Try Again</StyledText>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center">
      <ImageIcon size={64} color="#6B7280" />
      <StyledText className="text-gray-400 mt-4 text-center px-8">
        No cover art found for this track. Try searching with a different title or artist.
      </StyledText>
    </View>
  );

  return (
    <LinearGradient
      colors={["#1f2937", "#111827", "#000000"]}
      className="flex-1"
    >
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-gray-700">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1">
            <StyledText weight="semibold" className="text-white text-lg" numberOfLines={1}>
              {trackObj?.title || ""}
            </StyledText>
            <StyledText variant="caption" className="text-gray-400" numberOfLines={1}>
              {trackObj?.artist || "Unknown Artist"}
            </StyledText>
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
               <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-700">
                 <StyledText weight="semibold" className="text-white text-lg">
                   Cover Art Options
                 </StyledText>
                 <StyledText variant="caption" className="text-gray-400">
                   {searchResults.length} found
                 </StyledText>
               </View>
             }
           />
         ) : renderEmpty()}
      </SafeAreaView>
    </LinearGradient>
  );
}