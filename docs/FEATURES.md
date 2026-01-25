# Lumina: Feature List & Technical Roadmap

## 1. Core Visual Engine (Glassmorphism)

### 1.1. Aurora Background
- **Feature:** A persistent, hardware-accelerated background rendering animated color blobs.
- **Tech:** Reanimated + Linear Gradients.

### 1.2. Glassmorphic UI System
- **Component:** `GlassView`
- **Visuals:** Real-time backdrop blur (iOS) and optimized translucency (Android).
- **Styling:** Thin, semi-transparent borders and variable intensity based on component state.

---

## 2. Smart Home Modules

### 2.1. Glass Device Cards
- **Interaction:** Spring-based tactile feedback.
- **States:** 
  - `Inactive`: Low intensity, dark tint.
  - `Active`: High intensity, light tint, increased border vibrancy.

### 2.2. Interactive Glass Dial (Thermostat)
- **Design:** A frosted glass knob that rotates over an SVG track.
- **Feedback:** Real-time numeric updates and dynamic ring filling.

### 2.3. Lighting Control
- **Slider:** A vertical glass track with a vibrant thumb.
- **Glow:** Light emission around the bulb icon mapped to brightness values.

---

## 3. Navigation & UX

### 3.1. Floating Glass Tab Bar
- **Visuals:** A high-intensity glass bar floating at the bottom of the screen.

### 3.2. Seamless Transitions
- **Splash:** Animated Logo that morphs from the center into the header.

---

## 4. Technical Goals
- **Hardware Acceleration:** Zero JS-thread animations.
- **Platform Parity:** Optimized fallbacks for Android to ensure smooth performance without native blur.