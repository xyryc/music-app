import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { CoverArtProvider } from "@/contexts/cover-art-context";
import { PlayerProvider } from "@/contexts/player-provider";
import { storageService } from "@/services/storage";
import { setup } from "@baronha/ting";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme as useSystemColorScheme, View } from "react-native";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemColorScheme = useSystemColorScheme();
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    setup({
      toast: {
        backgroundColor: "#1F2937",
        titleColor: "#FFFFFF",
        messageColor: "#D1D5DB",
      },
    });
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
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: systemColorScheme === "dark" ? "#111827" : "#ffffff",
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <CoverArtProvider>
          <Stack initialRouteName="(tabs)">
            <Stack.Screen name="index" options={{ headerShown: false }} />
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