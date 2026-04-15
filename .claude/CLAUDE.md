# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native music player app built with Expo and expo-router. Supports local audio playback with media controls, library management, playlists, and cover art search.

## Commands

```bash
npm start           # Start Expo dev server
npm run android     # Build and run on Android
npm run ios         # Build and run on iOS
npm run web         # Run web version
npm run lint        # Run ESLint on app/ directory
```

## Architecture

### Routing
- Uses expo-router with file-based routing in `app/`
- Tab navigation in `app/(tabs)/` with three tabs: Library, Playlists, Settings
- Modal screens: `import.tsx`, `cover-art-search.tsx`, `player.tsx`

### Player System
The player is built around a hook-based architecture:
- `hooks/use-player.ts` - Core playback logic (play, pause, seek, queue management, shuffle, repeat)
- `services/audio.ts` - Low-level audio handling via `expo-av` and `expo-media-control`
- `contexts/player-provider.tsx` - React context exposing `{ state, controls }` to components
- Media controls (lock screen, notification) are synced via `updateMetadata` and `updatePlaybackState`

### Data Flow
- Tracks are stored in device storage via `services/storage.ts` using `expo-file-system` and `expo-secure-store`
- Library tracks have metadata: id, title, artist, album, duration, coverArt, uri, source
- Queue and play state persist across sessions

### Theme System
- Uses `nativewind` (Tailwind for React Native) with dark mode default
- Theme is stored in settings and applied via `useColorScheme` from nativewind
- Key colors: primary `#0A7EA4`, dark background `#111827`, light background `#FFFFFF`

### Key Files
- `app/_layout.tsx` - Root layout with providers (PlayerProvider, CoverArtProvider), Stack router, theme initialization
- `contexts/cover-art-context.tsx` - Manages cover art selection modal state
- `services/storage.ts` - Library, playlists, settings persistence