import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { PlayerProvider } from "@/contexts/player-provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
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
            name="player"
            options={{
              headerShown: false,
              presentation: "card",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}
