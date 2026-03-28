import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { StyledText } from "@/components/styled-text";
import { Track } from "@/types/track";
import { Download, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface TrackOptionsModalProps {
  isVisible: boolean;
  track: Track | null;
  onClose: () => void;
  onSearchCoverArt: () => void;
}

export function TrackOptionsModal({ isVisible, track, onClose, onSearchCoverArt }: TrackOptionsModalProps) {
  if (!track) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
    >
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 rounded-2xl w-80 overflow-hidden shadow-xl"
          activeOpacity={1}
        >
          {/* Header */}
          <LinearGradient
            colors={["#3B82F6", "#9333EA"]}
            className="p-4"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <StyledText weight="semibold" className="text-white text-lg">
                  {track.title}
                </StyledText>
                <StyledText variant="caption" className="text-white/80">
                  {track.artist || "Unknown Artist"}
                </StyledText>
              </View>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Options */}
          <View className="p-4">
            <TouchableOpacity
              onPress={() => {
                onClose();
                onSearchCoverArt();
              }}
              className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl mb-3"
            >
              <View className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center mr-4">
                <Download size={20} color="#FFFFFF" />
              </View>
              <View>
                <StyledText weight="medium">Search track cover art</StyledText>
                <StyledText variant="caption" className="text-gray-500 dark:text-gray-400">
                  Find and apply cover art for this track
                </StyledText>
              </View>
            </TouchableOpacity>

            {/* Add more options here in the future */}
            {/* <TouchableOpacity
              onPress={() => {
                onClose();
                // Handle other action
              }}
              className="flex-row items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <View className="w-10 h-10 bg-gray-400 rounded-lg items-center justify-center mr-4">
                <MoreIcon size={20} color="#FFFFFF" />
              </View>
              <View>
                <StyledText weight="medium">Other Option</StyledText>
                <StyledText variant="caption" className="text-gray-500 dark:text-gray-400">
                  Description of other action
                </StyledText>
              </View>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}