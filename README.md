# Lumina Smart

A smart home concept app built with React Native + Expo — a personal hobby project exploring advanced mobile UI patterns, custom animation systems, and component architecture.

<p align="center">
  <img src="assets/screenshots/Home.png" width="200" alt="Hub Dashboard" />
  <img src="assets/screenshots/bulb.png" width="200" alt="Light Device Detail" />
  <img src="assets/screenshots/thermostat.png" width="200" alt="Thermostat Detail" />
</p>

---

## Tech Stack

- **React Native + Expo** — Expo Router with file-based routing
- **TypeScript** — strict throughout
- **Zustand** — lightweight global state (`useDeviceStore`, `useConnectionStore`)
- **React Native Reanimated + Gesture Handler** — all animations and gesture interactions
- **React Native SVG** — custom circular sliders and colour pickers (no third-party UI libs)
- **expo-av** — audio playback for in-app music player
- **expo-linear-gradient + expo-symbols** — gradients and SF Symbols (iOS)
- **Neumorphic / glassmorphic design system** — custom theme tokens

---

## Architecture Highlights

- **File-based routing** via Expo Router (`app/(tabs)/`, `app/device/[id]`)
- **Custom design system** with `surface`, `accent`, `text`, `icon`, `shadowDark`, `shadowLight` theme tokens — consistent across light/dark mode
- **Per-device-type detail screens** (`light`, `thermostat`, `camera`, `lock`, `ac`, `solar`) in `src/features/device-detail/` — each with its own control set
- **Fully custom SVG components** — circular thermostat dial, colour temperature slider, and colour picker built from scratch with `react-native-svg`
- **Platform-aware shadows** — iOS `shadowColor/shadowOffset` props vs Android `elevation`, abstracted via `Shadows` constants
- **Animated toggle** — overdamped spring translation (no overshoot) with a separate bounce scale pulse on arrival
- **Music player** — `expo-av` with track queue, auto-advance on completion, and back-skip logic (restart if >3s in, else previous track)

---

## Screens

| Screen | Description |
|--------|-------------|
| **Hub** | Dashboard with scene modes, live camera carousel, categorised device grid, music player card, weather pill |
| **Device Detail** | Per-type controls — brightness slider, colour temp bar, colour palette, thermostat dial, schedule list |
| **Usage** | Energy and usage analytics view |
| **Flows** | Automation flows tab |
| **Settings** | App settings |

---

## Getting Started

```bash
npm install
npx expo start
```

> **iOS recommended** — uses SF Symbols via `expo-symbols`. Android falls back to Material Icons.
> **Mock data only** — no backend or real device integration.
