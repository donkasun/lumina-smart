/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#FF7D54";
const tintColorDark = "#FF7D54";

export const Colors = {
  light: {
    text: "#1F2937",
    background: "#F9F9F9",
    surface: "#FFFFFF",
    shadowDark: "#f0e1ce",
    shadowLight: "#FFFFFF",
    tint: tintColorLight,
    icon: "#877D76",
    tabIconDefault: "#877D76",
    tabIconSelected: tintColorLight,
    accent: "#FF7D54",
    activeText: "#10916D",
    subtext: "#6B7280",
    border: "#E5E7EB",
    primaryLight: "#FFEDD5",
    primaryDark: "#CC6443",
    statusOn: "#34D399",
    statusAlert: "#EF4444",
    statusInfo: "#3B82F6",
    // Header pills (weather, energy, live) – light
    surfaceElevated: "#FFFFFF",
    energyPillBg: "#FEFCE8",
    livePillBg: "#DCFCE7",
    energyPillText: "#92400E",
    energyPillIcon: "#92400E",
    energyPillIconAccent: "#FFD54F",
    livePillText: "#15803D",
    livePillDot: "#16A34A",
    weatherIconSun: "#FFD54F",
    weatherIconDrop: "#7CCFFF",
  },
  dark: {
    text: "#F3F4F6",
    background: "#121212",
    surface: "#1E1E1E",
    shadowDark: "#000000",
    shadowLight: "#1F1F1F", // Subtle highlight for dark mode
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    accent: "#FF7D54",
    activeText: "#03a376",
    subtext: "#9CA3AF",
    border: "#374151",
    primaryLight: "#FFEDD5",
    primaryDark: "#CC6443",
    statusOn: "#34D399",
    statusAlert: "#EF4444",
    statusInfo: "#3B82F6",
    // Header pills (weather, energy, live) – dark
    surfaceElevated: "#2A2A2A",
    energyPillBg: "#2A2A2A",
    livePillBg: "#2A2A2A",
    energyPillText: "#FDE68A",
    energyPillIcon: "#FDE68A",
    energyPillIconAccent: "#FCD34D",
    livePillText: "#86EFAC",
    livePillDot: "#4ADE80",
    weatherIconSun: "#FFD54F",
    weatherIconDrop: "#7CCFFF",
  },
};

/** Shared dimensions for header pills (weather, energy, live). */
export const PillLayout = {
  height: 26,
  borderRadius: 13,
  fontSize: 11,
} as const;

/** Plus Jakarta Sans – loaded in app/_layout.tsx. Use these for app UI text. */
export const Typography = {
  light: "PlusJakartaSans-Light",
  regular: "PlusJakartaSans-Regular",
  medium: "PlusJakartaSans-Medium",
  semiBold: "PlusJakartaSans-SemiBold",
  bold: "PlusJakartaSans-Bold",
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
