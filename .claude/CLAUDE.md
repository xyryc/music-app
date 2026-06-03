# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native music player built on Expo + expo-router. Core features: local file import/playback, lock-screen/media-notification controls, library + playlist management, cover-art lookup.

## Commands

```bash
npm install                  # install dependencies
npm start                    # Expo dev server
npm run android              # prebuild/run Android native app
npm run ios                  # prebuild/run iOS native app
npm run web                  # run web target
npm run lint                 # lint app/ with ESLint
npm run release:android:aab  # build Android AAB via script
npm run release:android:apk  # build Android APK via script
npm run release:android:both # build both APK + AAB
```

## Testing

No test runner configured in `package.json` yet (no `test` script). If tests are added, add script and document single-test command here.

## Architecture

### App shell + routing
- `app/_layout.tsx` initializes app-wide providers and router stack.
- Provider order matters: `PlayerProvider` wraps `CoverArtProvider`, both wrap stack screens.
- Theme bootstraps from persisted settings before first real render (dark placeholder view until ready).
- Navigation uses expo-router file routing with tabs in `app/(tabs)/` and modal/card-style screens for import, cover-art search, and full player.

### Playback pipeline (stateful hook + service)
- `hooks/use-player.ts` is source-of-truth for player state (`queue`, `queueIndex`, `repeatMode`, `isShuffled`, `position`, `duration`, `volume`, `currentTrack`).
- `services/audio.ts` owns `expo-av` sound instance and media-control integration (`expo-media-control`).
- `usePlayer` drives queue transitions (track end, next/prev, repeat-one/all, shuffle), then calls `audioService` side effects.
- `audioService` maps expo playback status to app status and syncs metadata/playback state to OS media controls.

### Persistence model
- `services/storage.ts` persists library, playlists, queue, and app settings in `expo-secure-store` under stable key namespace.
- Queue persists independently from library; playback state restores from saved queue/settings.
- Favorites playlist is special-cased (`id: "favorites"`) and auto-created on demand.

### Cross-cutting UI systems
- Styling/theme: `nativewind` + Tailwind classes, with `useColorScheme` controlled by stored setting (`light|dark|system`).
- Toasts: global `@baronha/ting` setup runs once in root layout.

## Important implementation notes

- Keep playback orchestration in `use-player.ts`; keep low-level audio/OS transport concerns in `services/audio.ts`.
- When changing track metadata shape, update both storage types (`types/track`) and media metadata sync path in `audioService.syncMediaControls`.
- `expo run:android` / `expo run:ios` perform native sync/build; use `npm start` for fastest JS-only iteration.
