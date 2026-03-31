import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { CoverArtProvider } from "@/contexts/cover-art-context";
import { PlayerProvider } from "@/contexts/player-provider";
import { storageService } from "@/services/storage";
import { setAlertFunction } from "@/utils/alert";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import DropdownAlert from "react-native-dropdownalert";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();

  const dropdownAlertStyle = {
    paddingTop: insets.top + 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  };


  useEffect(() => {
    storageService.getSettings().then((settings) => {
      setColorScheme(settings.theme);
    });
  }, [setColorScheme]);

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
          <DropdownAlert
            alert={setAlertFunction}
            dismissInterval={3000}
            updateStatusBar={false}
            showCancel={false}
            zIndex={1000}
            elevation={1000}
            alertViewStyle={dropdownAlertStyle}
          />
        </CoverArtProvider>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}
