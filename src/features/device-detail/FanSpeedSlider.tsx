import React, { useCallback } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PRIMARY } from './constants';

export const FAN_LABELS = ['Auto', 'Low', 'Med', 'High'];

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 8;
const SNAP_DURATION_MS = 280;
const SEGMENT_COUNT = FAN_LABELS.length - 1; // 3 segments → 4 positions (0–3)

export const FanSpeedSlider: React.FC<{
  value: number;
  onChange: (i: number) => void;
}> = ({ value, onChange }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const subtextColor = useThemeColor({}, 'icon');
  const trackWidth = useSharedValue(0);
  const trackBgColor = colorScheme === 'dark' ? 'rgba(55,65,81,0.8)' : 'rgba(226,232,240,0.8)';
  const thumbX = useSharedValue(0);

  const indexToX = (i: number, w: number) => (i / SEGMENT_COUNT) * (w - THUMB_SIZE);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      trackWidth.value = w;
      thumbX.value = indexToX(value, w);
    },
    [value, trackWidth, thumbX]
  );

  const updateIndex = useCallback((i: number) => onChange(i), [onChange]);

  const pan = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .failOffsetY([-5, 5])
    .onUpdate((e) => {
      'worklet';
      const maxX = trackWidth.value - THUMB_SIZE;
      thumbX.value = clamp(e.x - THUMB_SIZE / 2, 0, maxX);
    })
    .onEnd(() => {
      'worklet';
      const maxX = trackWidth.value - THUMB_SIZE;
      if (maxX <= 0) return;
      const ratio = thumbX.value / maxX;
      const nearestIndex = Math.round(
        Math.max(0, Math.min(SEGMENT_COUNT, ratio * SEGMENT_COUNT))
      );
      const w = trackWidth.value;
      const targetX = (nearestIndex / SEGMENT_COUNT) * (w - THUMB_SIZE);
      thumbX.value = withTiming(targetX, {
        duration: SNAP_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      runOnJS(updateIndex)(nearestIndex);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + THUMB_SIZE / 2,
  }));

  return (
    <GlassCard style={styles.fanCard}>
      <View style={styles.fanHeader}>
        <View style={styles.fanHeaderLeft}>
          <IconSymbol name="mode_fan" size={16} color={PRIMARY} />
          <Text style={[styles.sectionLabel, { color: subtextColor }]}>FAN SPEED</Text>
        </View>
        <View style={styles.fanBadge}>
          <Text style={styles.fanBadgeText}>{FAN_LABELS[value]}</Text>
        </View>
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.trackContainer} onLayout={onLayout}>
          <View style={[styles.track, { backgroundColor: trackBgColor }]} />
          <Animated.View
            style={[styles.trackFill, { backgroundColor: PRIMARY }, fillStyle]}
          />
          <Animated.View style={[styles.thumbWrapper, thumbStyle]}>
            <View
              style={[
                styles.thumb,
                { borderColor: PRIMARY },
                Shadows.card as object,
              ]}
            />
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={styles.fanLabels}>
        {FAN_LABELS.map((l) => (
          <Text key={l} style={[styles.fanLabel, { color: subtextColor }]}>
            {l}
          </Text>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  fanCard: {
    gap: 14,
  },
  fanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fanHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fanBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  fanBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
  fanLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fanLabel: {
    fontSize: 10,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
