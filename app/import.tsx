import { ScreenGradient } from "@/components/screen-gradient";
import { parseFilenameMetadata } from "@/services/track-metadata";
import { storageService } from "@/services/storage";
import { Track } from "@/types/track";
import { createAudioPlayer } from "expo-audio";
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
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "nativewind";
import { toast } from "@baronha/ting";

export default function ImportScreen() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { colorScheme } = useColorScheme();

  const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getDurationFromUri = async (uri: string): Promise<number> => {
    try {
      const player = createAudioPlayer(
        { uri },
        {
          downloadFirst: false,
          updateInterval: 500,
        },
      );
      const startedAt = Date.now();
      const timeoutMs = 5000;

      while (Date.now() - startedAt < timeoutMs) {
        const status = player.currentStatus;
        if (status.isLoaded) {
          const durationMillis = Math.round(status.duration * 1000);
          player.remove();
          return durationMillis;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      player.remove();
      return 0;
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
        const assetInfo = await getInfoAsync(asset.uri);
        if (!assetInfo.exists) {
          console.error("Source file does not exist:", asset.uri);
          continue;
        }

        const fileExt = asset.name.split(".").pop() || "mp3";
        const fileName = `${generateId()}.${fileExt}`;
        const permanentUri = `${tracksDir}${fileName}`;

        await copyAsync({
          from: asset.uri,
          to: permanentUri,
        });

        const checkInfo = await getInfoAsync(permanentUri);
        if (!checkInfo.exists || checkInfo.size === 0) {
          console.error("Failed to copy file or file is empty:", permanentUri);
          continue;
        }

        const duration = await getDurationFromUri(permanentUri);
        const filenameMetadata = parseFilenameMetadata(asset.name);

        const track: Track = {
          id: generateId(),
          title:
            filenameMetadata.title ||
            asset.name.replace(/\.[^/.]+$/, "") ||
            "Unknown Track",
          artist: filenameMetadata.artist,
          uri: permanentUri,
          source: "local",
          duration,
          dateAdded: Date.now(),
          playCount: 0,
        };

        await storageService.addToLibrary(track);
      }

      setIsImporting(false);
      toast({
        title: "Success",
        message: "Track(s) imported successfully!",
        preset: "done",
      });
      router.back();
    } catch (error) {
      console.error("Error importing file:", error);
      setIsImporting(false);
      toast({
        title: "Error",
        message: "Failed to import track. Please try again.",
        preset: "error",
      });
    }
  };

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        message: "Please enter a valid URL",
        preset: "error",
      });
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast({
        title: "Error",
        message: "URL must start with http:// or https://",
        preset: "error",
      });
      return;
    }

    setIsImporting(true);

    try {
      const duration = await getDurationFromUri(url);

      if (duration === 0) {
        toast({
          title: "Error",
          message: "Could not load audio from this URL",
          preset: "error",
        });
        setIsImporting(false);
        return;
      }

      const urlName = url.split("/").pop() || "Imported Track";
      const parsedUrlMetadata = parseFilenameMetadata(urlName);

      const track: Track = {
        id: generateId(),
        title: parsedUrlMetadata.title || urlName,
        artist: parsedUrlMetadata.artist,
        uri: url,
        source: "url",
        duration,
        dateAdded: Date.now(),
        playCount: 0,
      };

      await storageService.addToLibrary(track);
      setUrl("");
      setIsImporting(false);
      toast({
        title: "Success",
        message: "Track imported successfully!",
        preset: "done",
      });
      router.back();
    } catch (error) {
      console.error("Error importing URL:", error);
      setIsImporting(false);
      toast({
        title: "Error",
        message: "Failed to import from URL. Make sure it's a direct audio file link.",
        preset: "error",
      });
    }
  };

  return (
    <ScreenGradient>
      <View className="flex-row items-center px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <X size={24} color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Import Music</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
              <Upload size={24} color={colorScheme === "dark" ? "#38BDF8" : "#0A7EA4"} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">Import from Device</Text>
              <Text className={colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Select audio files from your file manager
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handlePickFile}
            disabled={isImporting}
            className="bg-blue-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-semibold">
              {isImporting ? "Importing..." : "Choose Files"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-4">
              <Link size={24} color={colorScheme === "dark" ? "#A78BFA" : "#7C3AED"} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">Import from URL</Text>
              <Text className={colorScheme === "dark" ? "text-gray-400" : "text-gray-600"}>
                Add a direct link to an audio file
              </Text>
            </View>
          </View>

          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/song.mp3"
            placeholderTextColor={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
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
            <Text className="text-white font-semibold">
              {isImporting ? "Importing..." : "Import from URL"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <View className="flex-row items-start">
            <Music size={20} color="#F59E0B" className="mt-0.5 mr-3" />
            <View className="flex-1">
              <Text className={colorScheme === "dark" ? "font-semibold text-amber-300 mb-1" : "font-semibold text-amber-800 mb-1"}>
                Supported Formats
              </Text>
              <Text className={colorScheme === "dark" ? "text-amber-200" : "text-amber-700"}>
                MP3, WAV, AAC, M4A, and other common audio formats. For URL
                imports, the link must point directly to an audio file.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenGradient>
  );
}
