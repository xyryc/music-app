import { ScreenGradient } from "@/components/screen-gradient";
import { StyledText } from "@/components/styled-text";
import { AppSettings, storageService } from "@/services/storage";
import { Info, Music, Smartphone, Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import {
  Alert,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { setColorScheme } = useColorScheme();
  const [settings, setSettings] = useState<AppSettings>({
    theme: "system",
    skipSilence: false,
    equalizerEnabled: false,
    showLyrics: false,
  });

  const loadSettings = useCallback(async () => {
    const data = await storageService.getSettings();
    setSettings(data);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    await storageService.saveSettings({ [key]: value });
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "theme") {
      setColorScheme(value as AppSettings["theme"]);
    }
  };

  const resetSettings: AppSettings = {
    theme: "system",
    skipSilence: false,
    equalizerEnabled: false,
    showLyrics: false,
  };

  const handleClearLibrary = () => {
    Alert.alert(
      "Clear Library",
      "Are you sure you want to remove all tracks from your library? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await storageService.clearAll();
            setSettings(resetSettings);
            setColorScheme(resetSettings.theme);
            Alert.alert("Success", "Library cleared successfully");
          },
        },
      ],
    );
  };

  const SettingItem = ({
    icon,
    title,
    description,
    value,
    onValueChange,
  }: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
          {icon}
        </View>
        <View className="flex-1">
          <StyledText weight="medium">{title}</StyledText>
          {description && (
            <StyledText variant="caption" className="text-gray-500">
              {description}
            </StyledText>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D1D5DB", true: "#0A7EA4" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScreenGradient>
      <View className="px-4 pt-14 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <StyledText variant="title" weight="bold">
          Settings
        </StyledText>
      </View>

      <ScrollView className="flex-1">
        {/* Theme Settings */}
        <View className="bg-white dark:bg-gray-900 mt-4 px-4">
          <StyledText
            variant="caption"
            className="text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4"
          >
            Appearance
          </StyledText>
          <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
                <Smartphone size={20} color="#6B7280" />
              </View>
              <View className="flex-1">
                <StyledText weight="medium">Theme</StyledText>
                <StyledText variant="caption" className="text-gray-500 dark:text-gray-400">
                  {settings.theme === "system"
                    ? "Follow system"
                    : settings.theme === "light"
                      ? "Light mode"
                      : "Dark mode"}
                </StyledText>
              </View>
            </View>
            <View className="flex-row gap-2">
              {(["system", "light", "dark"] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  onPress={() => updateSetting("theme", theme)}
                  className={`px-4 py-2 rounded-lg ${
                    settings.theme === theme
                      ? "bg-blue-500"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <StyledText
                    className={
                      settings.theme === theme
                        ? "text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }
                    weight="medium"
                  >
                    {theme === "system"
                      ? "Auto"
                      : theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </StyledText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Playback Settings */}
        <View className="bg-white dark:bg-gray-900 mt-4 px-4">
          <StyledText
            variant="caption"
            className="text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4"
          >
            Playback
          </StyledText>
          <SettingItem
            icon={<Music size={20} color="#6B7280" />}
            title="Skip Silence"
            description="Automatically skip silent parts"
            value={settings.skipSilence}
            onValueChange={(value) => updateSetting("skipSilence", value)}
          />
          <SettingItem
            icon={<Music size={20} color="#6B7280" />}
            title="Equalizer"
            description="Enable audio equalizer"
            value={settings.equalizerEnabled}
            onValueChange={(value) => updateSetting("equalizerEnabled", value)}
          />
        </View>

        {/* Data Management */}
        <View className="bg-white dark:bg-gray-900 mt-4 px-4">
          <StyledText
            variant="caption"
            className="text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4"
          >
            Data
          </StyledText>
          <TouchableOpacity
            onPress={handleClearLibrary}
            className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-lg bg-red-50 items-center justify-center mr-4">
                <Trash2 size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <StyledText weight="medium" className="text-red-600">
                  Clear Library
                </StyledText>
                <StyledText variant="caption" className="text-gray-500 dark:text-gray-400">
                  Remove all tracks and playlists
                </StyledText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View className="bg-white dark:bg-gray-900 mt-4 px-4 mb-8">
          <StyledText
            variant="caption"
            className="text-gray-500 dark:text-gray-400 uppercase mb-2 mt-4"
          >
            About
          </StyledText>
          <View className="flex-row items-center py-4">
            <View className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
              <Info size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <StyledText weight="medium">Version</StyledText>
              <StyledText variant="caption" className="text-gray-500 dark:text-gray-400">
                1.0.0
              </StyledText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenGradient>
  );
}
