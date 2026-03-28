import { StyledText } from "@/components/styled-text";
import { Track } from "@/types/track";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Download, Heart, Pencil, Share2, X } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

const placeholderOptions = [
  {
    key: "add-to-favorites",
    title: "Add to favorites",
    description: "Placeholder for a future track action",
    icon: Heart,
  },
  {
    key: "edit-metadata",
    title: "Edit metadata",
    description: "Placeholder for title, artist, and album edits",
    icon: Pencil,
  },
  {
    key: "share-track",
    title: "Share track",
    description: "Placeholder for sharing this track",
    icon: Share2,
  },
];

interface OptionRowProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  disabled?: boolean;
}

function OptionRow({
  title,
  description,
  icon: Icon,
  onPress,
  disabled = false,
}: OptionRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center px-5 py-4"
      style={{ opacity: disabled ? 0.55 : 1 }}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-4">
        <Icon size={18} color={disabled ? "#9CA3AF" : "#0A7EA4"} />
      </View>
      <View className="flex-1">
        <StyledText weight="medium">{title}</StyledText>
        <StyledText
          variant="caption"
          className="text-gray-500 dark:text-gray-400"
        >
          {description}
        </StyledText>
      </View>
    </TouchableOpacity>
  );
}

interface TrackOptionsModalProps {
  isVisible: boolean;
  track: Track | null;
  onClose: () => void;
  onSearchCoverArt: (track: Track) => void;
}

export function TrackOptionsModal({
  isVisible,
  track,
  onClose,
  onSearchCoverArt,
}: TrackOptionsModalProps) {
  const sheetRef = useRef<TrueSheet>(null);

  useEffect(() => {
    const syncSheet = async () => {
      if (!sheetRef.current || !track) {
        return;
      }

      if (isVisible) {
        await sheetRef.current.present();
      } else {
        await sheetRef.current.dismiss();
      }
    };

    syncSheet();
  }, [isVisible, track]);

  if (!track) return null;

  return (
    <TrueSheet
      ref={sheetRef}
      detents={["auto"]}
      cornerRadius={24}
      grabber
      dismissible
      dimmed
      onDidDismiss={onClose}
      backgroundColor="#111827"
    >
      <View className="bg-white dark:bg-gray-800 overflow-hidden">
        <LinearGradient
          colors={["#3B82F6", "#9333EA"]}
          className="px-5 pb-4 pt-8"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-3">
              <StyledText
                weight="semibold"
                className="text-white text-lg"
                numberOfLines={1}
              >
                {track.title}
              </StyledText>
              <StyledText
                variant="caption"
                className="text-white/80"
                numberOfLines={1}
              >
                {track.artist || "Unknown Artist"}
              </StyledText>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await sheetRef.current?.dismiss();
              }}
              className="p-1.5"
            >
              <X size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className="pt-1">
          <OptionRow
            title="Search track cover art"
            description="Find and apply cover art for this track"
            icon={Download}
            onPress={async () => {
              const currentTrack = track;
              await sheetRef.current?.dismiss();
              onSearchCoverArt(currentTrack);
            }}
          />

          <View
            className="bg-gray-200 dark:bg-gray-700 ml-[68px] mr-4"
            style={{ height: 1 }}
          />

          {placeholderOptions.map((option, index) => (
            <React.Fragment key={option.key}>
              <OptionRow
                title={option.title}
                description={option.description}
                icon={option.icon}
                disabled
              />
              {index !== placeholderOptions.length - 1 && (
                <View
                  className="bg-gray-200 dark:bg-gray-700 ml-[68px] mr-4"
                  style={{ height: 1 }}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        <View className="pb-6">
          <View style={{ height: 8 }} />
        </View>
      </View>
    </TrueSheet>
  );
}
