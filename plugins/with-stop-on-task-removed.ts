import {
  withAndroidManifest,
  AndroidConfig,
  type ConfigPlugin,
} from "expo/config-plugins";

/**
 * Expo config plugin that adds `android:stopWithTask="true"` to the
 * `MediaPlaybackService` from `expo-media-control`.
 *
 * On Android, when a user swipes the app away from the recents screen,
 * the system calls `onTaskRemoved()` on any running foreground services.
 * Without `stopWithTask="true"`, the service continues running indefinitely
 * — music keeps playing and the notification stays visible.
 *
 * This plugin injects the attribute into the AndroidManifest so the
 * foreground service is properly stopped when the task is removed.
 */
const withStopOnTaskRemoved: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Ensure the `tools` namespace is present (needed for `tools:node="merge"`)
    if (!androidManifest.manifest.$["xmlns:tools"]) {
      androidManifest.manifest.$["xmlns:tools"] =
        "http://schemas.android.com/tools";
    }

    // Locate the <application> block
    const mainApplication =
      AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);

    // Ensure the `service` array exists
    if (!mainApplication["service"]) {
      mainApplication["service"] = [];
    }

    const services = mainApplication["service"];

    // Check if the MediaPlaybackService is already declared in the app manifest
    const existingIndex = services.findIndex((s: any) => {
      const name = s.$?.["android:name"];
      return name === "expo.modules.mediacontrol.MediaPlaybackService";
    });

    if (existingIndex >= 0) {
      // Service exists — just add stopWithTask
      (services[existingIndex] as any).$["android:stopWithTask"] = "true";
    } else {
      // Service is declared in the library's manifest — we add a merger node
      // that adds stopWithTask. The Android manifest merger combines this
      // with the library's service declaration.
      services.push({
        $: {
          "android:name": "expo.modules.mediacontrol.MediaPlaybackService",
          "android:stopWithTask": "true",
          "tools:node": "merge",
        },
      } as any);
    }

    return config;
  });
};

export default withStopOnTaskRemoved;
