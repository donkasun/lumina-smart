/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#FF7F5C";
const tintColorDark = "#FF7F5C";

export const Colors = {
  light: {
    text: "#463F3A",
    background: "#F9F5F1",
    surface: "#F9F5F1",
    shadowDark: "#f0e6da",
    shadowLight: "#FFFFFF",
    tint: tintColorLight,
    icon: "#877D76",
    tabIconDefault: "#877D76",
    tabIconSelected: tintColorLight,
    accent: "#FF7F5C",
    activeText: "#10916D",
  },
  dark: {
    text: "#ECEDEE",
    background: "#121212", // Match surface for Neumorphism
    surface: "#121212",
    shadowDark: "#000000",
    shadowLight: "#1F1F1F", // Subtle highlight for dark mode
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    accent: "#FF7F5C",
    activeText: "#10916D",
  },
};

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
