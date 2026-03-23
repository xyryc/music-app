# GEMINI.md - Project Context

## Project Overview
**Name:** qwen-test-app
**Type:** React Native / Expo Mobile Application (Music Player)
**Core Functionality:** A modern music player app built with Expo, featuring local file imports, playlist management, and a rich "Now Playing" interface.

## Tech Stack
- **Framework:** [Expo](https://expo.dev) (SDK 54) / React Native 0.81.5
- **Language:** TypeScript
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management:** React Context API (`PlayerProvider`)
- **Audio Engine:** [expo-av](https://docs.expo.dev/versions/latest/sdk/av/)
- **Icons:** [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Animations:** [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/)
- **Storage:** `expo-secure-store` and `expo-file-system`

## Architecture
The project follows a modular structure:
- **`app/`**: Contains the Expo Router file-based navigation (tabs, layouts, and screens).
- **`components/`**: Reusable UI components (e.g., `track-item.tsx`, `mini-player.tsx`).
- **`contexts/`**: Global state providers, primarily `player-provider.tsx` for audio state.
- **`hooks/`**: Custom React hooks like `use-player.ts` for interacting with the player.
- **`services/`**: Core business logic, including `audio.ts` (audio playback singleton) and `storage.ts`.
- **`types/`**: TypeScript interfaces and types for tracks, playlists, and player state.
- **`constants/`**: Design system constants and application-wide settings.

## Development Commands
- **Install Dependencies:** `npm install`
- **Start Development Server:** `npx expo start`
- **Run on Android:** `npm run android`
- **Run on iOS:** `npm run ios`
- **Run Web Version:** `npm run web`
- **Lint Code:** `npm run lint`

## Development Conventions
- **Path Aliases:** Use `@/` for root-level imports (e.g., `import { Track } from "@/types/track"`).
- **Styling:** Prefer NativeWind `className` strings for styling. Refer to `tailwind.config.js` for custom configurations.
- **Typography:** Use the `StyledText` component (in `components/styled-text.tsx`) to ensure consistent font weights and styles across the app.
- **Audio Logic:** All audio operations should go through the `audioService` singleton in `services/audio.ts` to maintain a single source of truth for playback.
- **Icons:** Use `lucide-react-native` for consistent iconography.
- **Performance:** Utilize `useMemo` and `useCallback` in the `PlayerProvider` to prevent unnecessary re-renders of the audio state consumers.

## Key Files
- `app/_layout.tsx`: Root layout wrapping the app in `GestureHandlerRootView` and `PlayerProvider`.
- `contexts/player-provider.tsx`: The primary state hub for the music player.
- `services/audio.ts`: Encapsulates `expo-av` logic into a clean `AudioService` class.
- `constants/design-system.ts`: Defines the spacing, typography, and border-radius scales.
- `tailwind.config.js`: Configuration for NativeWind/Tailwind CSS.

## Notes
- This app uses a custom `AudioService` that manages `Audio.Sound` instances. Always ensure proper `unload()` calls to prevent memory leaks and overlapping audio.
- The project includes a `react-native-best-practices` skill located in `.agents/skills/`, which provides advanced optimization guidelines.
