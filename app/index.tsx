import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, useColorScheme, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.replace("/library");
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../assets/images/app-icon.png")}
        style={{ width: 180, height: 180, borderRadius: 20 }}
        resizeMode="contain"
      />
    </View>
  );
}
