import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React, { useCallback } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

interface BrightnessSliderProps {
  value: number; // 0–100
  onChange: (value: number) => void;
  isOn?: boolean; // when false, slider and thumb use gray
}

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 8;
const PRIMARY = '#FF7D54';
const TRACK_OFF = '#9CA3AF';

export const BrightnessSlider: React.FC<BrightnessSliderProps> = ({ value, onChange, isOn = true }) => {
  const accentColor = isOn ? PRIMARY : TRACK_OFF;
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue((value / 100) * 1); // will be recalculated on layout
  const currentValue = useSharedValue(value);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      trackWidth.value = w;
      thumbX.value = (value / 100) * (w - THUMB_SIZE);
    },
    [value, trackWidth, thumbX]
  );

  const updateValue = useCallback(
    (v: number) => {
      onChange(v);
    },
    [onChange]
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .failOffsetY([-5, 5])
    .onUpdate((e) => {
      const maxX = trackWidth.value - THUMB_SIZE;
      thumbX.value = clamp(e.x - THUMB_SIZE / 2, 0, maxX);
      currentValue.value = Math.round((thumbX.value / maxX) * 100);
    })
    .onEnd(() => {
      runOnJS(updateValue)(currentValue.value);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol name="lightbulb" size={16} color={textColor} />
          <Text style={[styles.label, { color: subtextColor }]}>Brightness</Text>
        </View>
        <Text style={[styles.valueText, { color: textColor }]}>{value}%</Text>
      </View>

      <GestureDetector gesture={pan}>
        <View style={styles.trackContainer} onLayout={onLayout}>
          {/* Track background */}
          <View style={[styles.track, { backgroundColor: 'rgba(226,232,240,0.8)' }]} />
          {/* Active fill */}
          <Animated.View
            style={[styles.trackFill, { backgroundColor: accentColor }, fillStyle]}
          />
          {/* Thumb */}
          <Animated.View style={[styles.thumbWrapper, thumbStyle]}>
            <View
              style={[
                styles.thumb,
                { borderColor: accentColor },
                Shadows.card as object,
              ]}
            />
          </Animated.View>
        </View>
      </GestureDetector>
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
    justifyContent: 'space-between',
  },
  headerLeft: {
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
  valueText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  trackContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  trackFill: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
  },
  thumbWrapper: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
});
