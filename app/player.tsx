import { NowPlayingScreen } from "@/components/now-playing-screen";
import { StyledText } from "@/components/styled-text";
import { usePlayer } from "@/contexts/player-provider";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PlayerScreen() {
  const router = useRouter();
  const { state } = usePlayer();

  const handleMinimize = () => {
    router.back();
  };

  if (!state.currentTrack) {
    return (
      <View style={styles.container}>
        <StyledText className="text-white text-lg">No track playing</StyledText>
      </View>
    );
  }

  return (
    <NowPlayingScreen onMinimize={handleMinimize} initialTrack={state.currentTrack} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
});
