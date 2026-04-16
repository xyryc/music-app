import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { CoverArtProvider } from "@/contexts/cover-art-context";
import { PlayerProvider } from "@/contexts/player-provider";
import { storageService } from "@/services/storage";
import { configureAlert } from "@/utils/alert";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    configureAlert();
  }, []);

  useEffect(() => {
    let isMounted = true;

    storageService.getSettings().then((settings) => {
      if (!isMounted) {
        return;
      }

      setColorScheme(settings.theme);
      setIsThemeReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [setColorScheme]);

  if (!isThemeReady) {
    return <View style={{ flex: 1, backgroundColor: "#111827" }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <CoverArtProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="import"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="cover-art-search"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="player"
              options={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_bottom",
              }}
            />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </CoverArtProvider>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}