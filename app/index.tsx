import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, View } from "react-native";

export default function Index() {
  const router = useRouter();

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
        backgroundColor: "#111827",
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
