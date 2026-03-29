import { Redirect } from "expo-router";

// Default route - immediately redirect to the library tab
export default function Index() {
  return <Redirect href="/(tabs)/library" />;
}
