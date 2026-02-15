import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { GlassView } from '@/src/components/ui/GlassView';
import { haptics } from '@/src/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const COLOUR_PRESETS = [
  '#FF7D54',
  '#FFCF54',
  '#54FF93',
  '#54B0FF',
  '#D554FF',
  '#FF5454',
  '#54FFF1',
  '#FFFFFF',
  '#A855F7',
];

const PRIMARY = '#FF7D54';
const SWATCH_SIZE = 44;

interface ColourPaletteProps {
  selectedColor?: string;
  onColorChange: (color: string) => void;
}

interface SwatchProps {
  color: string;
  isSelected: boolean;
  onPress: () => void;
}

const Swatch: React.FC<SwatchProps> = ({ color, isSelected, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(1.08, { duration: 150, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    haptics.tap();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.swatchOuter,
          isSelected && { borderColor: PRIMARY, borderWidth: 2 },
          animatedStyle,
          Shadows.pill as object,
        ]}
      >
        <View style={[styles.swatch, { backgroundColor: color }]} />
      </Animated.View>
    </Pressable>
  );
};

export const ColourPalette: React.FC<ColourPaletteProps> = ({
  selectedColor,
  onColorChange,
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const handleSwatchPress = useCallback(
    (color: string) => {
      onColorChange(color);
    },
    [onColorChange]
  );

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <IconSymbol name="paintbrush" size={16} color={textColor} />
        <Text style={[styles.label, { color: subtextColor }]}>Colour Palette</Text>
      </View>

      <View style={styles.grid}>
        {COLOUR_PRESETS.map((color) => (
          <Swatch
            key={color}
            color={color}
            isSelected={selectedColor === color}
            onPress={() => handleSwatchPress(color)}
          />
        ))}
        {/* Custom picker trigger (no-op for now) */}
        <GlassView style={styles.paletteCell}>
          <Ionicons name="add" size={24} color={PRIMARY} />
        </GlassView>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchOuter: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: 16,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatch: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  paletteCell: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderWidth: 2,
    borderColor: 'rgba(255, 125, 84, 0.25)',
  },
});
