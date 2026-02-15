import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface ColourTemperatureBarProps {
  value?: number; // 0–100, 0 = warm, 100 = cool
  onChange?: (value: number) => void;
}

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 8;
const PRIMARY = '#FF7D54';

export const ColourTemperatureBar: React.FC<ColourTemperatureBarProps> = ({
  value = 30,
  onChange,
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);
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
      if (onChange) onChange(v);
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

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <IconSymbol name="thermometer" size={16} color={textColor} />
        <Text style={[styles.label, { color: subtextColor }]}>Colour Temperature</Text>
      </View>

      <View>
        <GestureDetector gesture={pan}>
          <View style={styles.trackContainer} onLayout={onLayout}>
            <LinearGradient
              colors={['#F97316', '#FFFFFF', '#60A5FA']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradientTrack}
            />
            <Animated.View style={[styles.thumbWrapper, thumbStyle]}>
              <View style={[styles.thumb, { borderColor: PRIMARY }, Shadows.card as object]} />
            </Animated.View>
          </View>
        </GestureDetector>

        <View style={styles.labelsRow}>
          <Text style={[styles.labelText, { color: subtextColor }]}>Warm</Text>
          <Text style={[styles.labelText, { color: subtextColor }]}>Cool</Text>
        </View>
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
  trackContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  gradientTrack: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
    right: 0,
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
    borderColor: '#FFFFFF',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 8,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
  },
});
