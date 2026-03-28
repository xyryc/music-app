import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to library
    router.replace("/(tabs)/library");
  }, [router]);

  // Show a minimal loading indicator while redirecting
  return null;
}
