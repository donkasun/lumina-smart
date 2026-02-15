import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/src/utils/haptics';

interface ColorPickerProps {
  selectedColor?: string;
  onChange: (color: string) => void;
  size?: number;
}

const PRESET_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#FFD93D', // Yellow
];

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 100, l: 50 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const indicatorShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
}) ?? {};

const presetShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
}) ?? {};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onChange,
  size = 200,
}) => {
  const textColor = useThemeColor({}, 'text');

  const [currentColor, setCurrentColor] = useState(selectedColor || '#FF6B6B');

  const center = size / 2;
  const radius = size / 2 - 10;

  const selectedX = useSharedValue(center);
  const selectedY = useSharedValue(center);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onChange(color);
    haptics.tap();
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const x = e.x - center;
      const y = e.y - center;
      const distance = Math.sqrt(x * x + y * y);

      if (distance <= radius) {
        selectedX.value = e.x;
        selectedY.value = e.y;

        const angle = Math.atan2(y, x);
        const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
        const saturation = (distance / radius) * 100;
        const color = hslToHex(hue, saturation, 50);

        runOnJS(handleColorChange)(color);
      }
    });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: selectedX.value - 12 },
      { translateY: selectedY.value - 12 },
    ],
  }));

  // Build color wheel circles: every 3° (120 hues) × 5 saturation rings = 600 circles
  const wheelCircles: React.ReactElement[] = [];
  for (let i = 0; i < 360; i += 3) {
    const angle = (i * Math.PI) / 180;
    for (let j = 0; j < 5; j++) {
      const r = (radius / 5) * (j + 1);
      const saturation = ((j + 1) / 5) * 100;
      const color = hslToHex(i, saturation, 50);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      wheelCircles.push(
        <Circle key={`${i}-${j}`} cx={x} cy={y} r={2.5} fill={color} />
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>Color</Text>

      <GestureDetector gesture={pan}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            {wheelCircles}
          </Svg>

          {/* Selection indicator — native Animated.View positioned over SVG */}
          <Animated.View style={[styles.indicator, indicatorStyle, indicatorShadow]}>
            <View style={[styles.indicatorInner, { backgroundColor: currentColor }]} />
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Preset colors */}
      <View style={styles.presetContainer}>
        {PRESET_COLORS.map((color) => (
          <Pressable
            key={color}
            onPress={() => {
              handleColorChange(color);
              const hsl = hexToHSL(color);
              const angle = (hsl.h * Math.PI) / 180;
              const distance = (hsl.s / 100) * radius;
              selectedX.value = center + Math.cos(angle) * distance;
              selectedY.value = center + Math.sin(angle) * distance;
            }}
            style={[
              styles.presetButton,
              { backgroundColor: color },
              presetShadow,
              currentColor === color && styles.presetSelected,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  indicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  presetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  presetSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});
