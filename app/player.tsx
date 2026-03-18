import { NowPlayingScreen } from "@/components/now-playing-screen";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlayerScreen() {
  const router = useRouter();

  const handleMinimize = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <NowPlayingScreen onMinimize={handleMinimize} />
    </SafeAreaView>
  );
}
