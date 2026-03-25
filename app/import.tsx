import { StyledText } from "@/components/styled-text";
import { storageService } from "@/services/storage";
import { Track } from "@/types/track";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import {
  documentDirectory,
  makeDirectoryAsync,
  copyAsync,
  getInfoAsync,
} from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { Link, Music, Upload, X } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ImportScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getDurationFromUri = async (uri: string): Promise<number> => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: false,
          androidImplementation: 'MediaPlayer',
        },
      );
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();
      return (status as any).durationMillis || 0;
    } catch (error) {
      console.error("Error getting duration:", error);
      return 0;
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsImporting(true);

      const tracksDir = `${documentDirectory}tracks/`;
      const dirInfo = await getInfoAsync(tracksDir);
      if (!dirInfo.exists) {
        await makeDirectoryAsync(tracksDir, { intermediates: true });
      }

      for (const asset of result.assets) {
        // Verify source file exists
        const assetInfo = await getInfoAsync(asset.uri);
        if (!assetInfo.exists) {
          console.error("Source file does not exist:", asset.uri);
          continue;
        }

        const fileExt = asset.name.split(".").pop() || "mp3";
        const fileName = `${generateId()}.${fileExt}`;
        const permanentUri = `${tracksDir}${fileName}`;

        // Copy from cache to permanent storage
        await copyAsync({
          from: asset.uri,
          to: permanentUri,
        });

        // Verify copied file
        const checkInfo = await getInfoAsync(permanentUri);
        if (!checkInfo.exists || checkInfo.size === 0) {
          console.error("Failed to copy file or file is empty:", permanentUri);
          continue;
        }

        // Use the permanent URI to get duration and for playback
        const duration = await getDurationFromUri(permanentUri);

        const track: Track = {
          id: generateId(),
          title: asset.name.replace(/\.[^/.]+$/, "") || "Unknown Track",
          uri: permanentUri,
          source: "local",
          duration: duration,
          dateAdded: Date.now(),
          playCount: 0,
        };

        await storageService.addToLibrary(track);
      }

      setIsImporting(false);
      Alert.alert("Success", "Track(s) imported successfully!");
      router.back();
    } catch (error) {
      console.error("Error importing file:", error);
      setIsImporting(false);
      Alert.alert("Error", "Failed to import track. Please try again.");
    }
  };

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a valid URL");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      Alert.alert("Error", "URL must start with http:// or https://");
      return;
    }

    setIsImporting(true);

    try {
      const duration = await getDurationFromUri(url);

      if (duration === 0) {
        Alert.alert("Error", "Could not load audio from this URL");
        setIsImporting(false);
        return;
      }

      const track: Track = {
        id: generateId(),
        title: url.split("/").pop() || "Imported Track",
        uri: url,
        source: "url",
        duration: duration,
        dateAdded: Date.now(),
        playCount: 0,
      };

      await storageService.addToLibrary(track);
      setUrl("");
      setIsImporting(false);
      Alert.alert("Success", "Track imported successfully!");
      router.back();
    } catch (error) {
      console.error("Error importing URL:", error);
      setIsImporting(false);
      Alert.alert(
        "Error",
        "Failed to import from URL. Make sure it's a direct audio file link.",
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <X size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <StyledText variant="title" weight="bold">
          Import Music
        </StyledText>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Import from File */}
        <View className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
              <Upload size={24} color="#0A7EA4" />
            </View>
            <View className="flex-1">
              <StyledText weight="semibold" className="text-lg">
                Import from Device
              </StyledText>
              <StyledText variant="caption" className="text-gray-500">
                Select audio files from your file manager
              </StyledText>
            </View>
          </View>
          <TouchableOpacity
            onPress={handlePickFile}
            disabled={isImporting}
            className="bg-blue-500 py-3 rounded-lg items-center"
          >
            <StyledText className="text-white font-semibold">
              {isImporting ? "Importing..." : "Choose Files"}
            </StyledText>
          </TouchableOpacity>
        </View>

        {/* Import from URL */}
        <View className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
              <Link size={24} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <StyledText weight="semibold" className="text-lg">
                Import from URL
              </StyledText>
              <StyledText variant="caption" className="text-gray-500">
                Add a direct link to an audio file
              </StyledText>
            </View>
          </View>

          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/song.mp3"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 mb-3 text-base text-gray-900 dark:text-gray-100"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isImporting}
          />

          <TouchableOpacity
            onPress={handleImportFromUrl}
            disabled={isImporting || !url.trim()}
            className={`py-3 rounded-lg items-center ${
              isImporting || !url.trim() ? "bg-gray-300" : "bg-purple-500"
            }`}
          >
            <StyledText className="text-white font-semibold">
              {isImporting ? "Importing..." : "Import from URL"}
            </StyledText>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <View className="flex-row items-start">
            <Music size={20} color="#F59E0B" className="mt-0.5 mr-3" />
            <View className="flex-1">
              <StyledText weight="semibold" className="text-amber-800 mb-1">
                Supported Formats
              </StyledText>
              <StyledText variant="caption" className="text-amber-700">
                MP3, WAV, AAC, M4A, and other common audio formats. For URL
                imports, the link must point directly to an audio file.
              </StyledText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
