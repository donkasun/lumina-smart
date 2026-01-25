# PRD: Project "Lumina" (Glassmorphism Edition)

| Metadata            | Details                                                                       |
| :------------------ | :---------------------------------------------------------------------------- |
| **Product Name**    | Lumina Smart Home                                                             |
| **Platform**        | React Native (iOS & Android)                                                  |
| **Primary Tech**    | `expo-blur`, `react-native-reanimated`, `expo-linear-gradient`                |
| **Core Competency** | Glassmorphism, Multi-layered Visual Depth, Hardware-accelerated Motion.       |
| **Status**          | **Approved** (Glassmorphism adopted for a modern, immersive aesthetic)         |

---

## 1. Executive Summary

**Lumina** is a high-fidelity smart home dashboard designed to showcase the **Glassmorphism** aesthetic. By using `expo-blur` and a dynamic, animated background, we create an interface with multi-layered depth, where UI elements appear as frosted glass floating over a vibrant, moving environment.

**Portfolio Narrative:**
"I architected Lumina using a glassmorphic design system, leveraging native blur modules and hardware-accelerated animations. This project demonstrates my ability to create immersive, premium UIs that maintain high performance while utilizing complex visual effects like backdrop filters and persistent animated backgrounds."

---

## 2. Design Philosophy

- **Visual Style:** **Glassmorphism**. High translucency, backdrop blur, and thin, vibrant borders.
- **Surface Depth:** UI elements are layered on top of an animated "Aurora" background.
- **Motion:** Fluid, spring-based transitions that emphasize the physical feel of glass panels.

---

## 3. Functional Requirements

### 3.1. The Dashboard (Glass Grid)

- **Masonry Layout:** A 2-column grid displaying device status.
- **Dynamic Background:** A persistent "Aurora" background with floating gradients.
- **Glass Cards:** Every widget uses `GlassView` for real-time blur (iOS) or optimized translucent fallbacks (Android).

### 3.2. Interactive Controls

- **Tactile Feedback:** Cards scale and change intensity on interaction.
- **Animated Navigation:** A floating glass tab bar that maintains its state across transitions.

---

## 4. Technical Architecture (The Stack)

### 4.1. Core Dependencies

| Library                          | Purpose             | Justification                                                      |
| :------------------------------- | :------------------ | :----------------------------------------------------------------- |
| **expo-blur**                    | Glass Effect        | Native backdrop blur for iOS.                                      |
| **react-native-reanimated**      | Animation           | UI thread driven motion.                                           |
| **expo-linear-gradient**         | Gradients           | Used for the Aurora background and glass highlights.               |
| **react-native-svg**             | Vector Graphics     | Custom icons and complex controls.                                 |
| **zustand**                      | State               | Efficient state management.                                        |

---

## 5. Detailed Implementation Specs

### 5.1. Glassmorphism Components

- **iOS:** Uses `BlurView` with `intensity` and `tint`.
- **Android:** Uses high-opacity translucent backgrounds with precise border-widths and subtle elevations to simulate depth.

### 5.2. Animation Strategy

- **Zero Bridge Traffic:** All gestures and animations run on the UI thread via Worklets.
- **Persistence:** Background and navigation are wrapped at the root level to ensure visual continuity.

---

## 6. Directory Structure

```text
src/
├── components/
│   ├── ui/
│   │   ├── GlassView.tsx       <-- Core glass component
│   │   └── Logo.tsx
│   ├── background/
│   │   └── AuroraBackground.tsx
├── features/
│   ├── dashboard/
│   │   ├── DeviceCard.tsx      <-- Uses GlassView
│   │   └── useDeviceStore.ts
└── utils/
    └── date.ts
```