import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/src/components/ui/GlassView';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/src/utils/haptics';

const DIAL_SIZE = 280;
const CENTER = DIAL_SIZE / 2;
const RADIUS = 120;
const STROKE_WIDTH = 16;

// Hot/warm = orange (right side of dial), Cold/cool = blue (left side)
const WARM_COLOR = '#FF7D54';
const COOL_COLOR = '#3B82F6';

// Arc symmetric around top (12 o'clock): -240° (8 o'clock) to +60° (4 o'clock), 300° total, 60° gap at bottom
const ARC_START = -240;
const ARC_END = 60;
const ARC_SWEEP = ARC_END - ARC_START; // 300
const ARC_HALF = 150; // each segment 150°

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const createArcPath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepAngle: number
): string => {
  if (sweepAngle <= 0) return '';
  const clampedSweep = Math.min(sweepAngle, 359.999);
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, startAngle + clampedSweep);
  const largeArc = clampedSweep > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

// Left half of arc (cooler temps): -240° → -90° (12 o'clock) = blue
// Right half (warmer temps): -90° → +60° = orange
const COOL_PATH = createArcPath(CENTER, CENTER, RADIUS, ARC_START, ARC_HALF);
const WARM_PATH = createArcPath(CENTER, CENTER, RADIUS, -90, ARC_HALF);

interface ThermostatDialProps {
  value: number; // temperature in °C
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export const ThermostatDial: React.FC<ThermostatDialProps> = ({
  value,
  min = 16,
  max = 30,
  onChange,
}) => {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#FF7D54';

  // Map value to angle: min → ARC_START (-240°), max → ARC_END (60°)
  const valueToAngle = useCallback(
    (v: number) => {
      const normalized = (v - min) / (max - min);
      return ARC_START + normalized * ARC_SWEEP;
    },
    [min, max]
  );

  const currentAngle = useSharedValue(valueToAngle(value));
  const currentValue = useSharedValue(value);
  const lastHapticValue = useSharedValue(Math.round(value));

  useEffect(() => {
    currentAngle.value = valueToAngle(value);
    currentValue.value = value;
    lastHapticValue.value = Math.round(value);
  }, [value, valueToAngle, currentAngle, currentValue, lastHapticValue]);

  const updateValue = useCallback(
    (v: number) => {
      if (onChange) onChange(v);
    },
    [onChange]
  );

  const triggerDegreeHaptic = useCallback(() => {
    haptics.toggle();
  }, []);

  const TAP_ANIM_DURATION = 250;

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      const dx = e.x - CENTER;
      const dy = e.y - CENTER;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < ARC_START) angle = ARC_START;
      if (angle > ARC_END) angle = ARC_END;
      currentAngle.value = angle;
      const normalized = (angle - ARC_START) / ARC_SWEEP;
      const clamped = Math.max(0, Math.min(1, normalized));
      const v = Math.round(min + clamped * (max - min));
      currentValue.value = v;
      const rounded = Math.round(v);
      if (rounded !== lastHapticValue.value) {
        lastHapticValue.value = rounded;
        runOnJS(triggerDegreeHaptic)();
      }
    })
    .onEnd(() => {
      'worklet';
      const v = currentValue.value;
      runOnJS(updateValue)(v);
    });

  const tap = Gesture.Tap()
    .onEnd((e) => {
      'worklet';
      const x = e.x;
      const y = e.y;
      const dx = x - CENTER;
      const dy = y - CENTER;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (angle < ARC_START) angle = ARC_START;
      if (angle > ARC_END) angle = ARC_END;
      const normalized = (angle - ARC_START) / ARC_SWEEP;
      const clamped = Math.max(0, Math.min(1, normalized));
      const targetValue = Math.round(min + clamped * (max - min));
      currentValue.value = targetValue;
      lastHapticValue.value = targetValue;
      runOnJS(triggerDegreeHaptic)();
      currentAngle.value = withTiming(angle, {
        duration: TAP_ANIM_DURATION,
      }, (finished) => {
        if (finished) {
          runOnJS(updateValue)(targetValue);
        }
      });
    });

  const composed = Gesture.Race(pan, tap);

  const thumbStyle = useAnimatedStyle(() => {
    'worklet';
    const angleRad = (currentAngle.value * Math.PI) / 180;
    const cx = CENTER + RADIUS * Math.cos(angleRad) - 12;
    const cy = CENTER + RADIUS * Math.sin(angleRad) - 12;
    return {
      transform: [{ translateX: cx }, { translateY: cy }],
    };
  });

  // Frosted disk shadow
  const diskShadow = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.10,
      shadowRadius: 24,
    },
    android: { elevation: 6 },
  }) ?? {};

  const isHeating = value > 21;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <View style={styles.dialWrapper}>
          <Svg
            width={DIAL_SIZE}
            height={DIAL_SIZE}
            viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
          >
            {/* Cool arc (left, blue) */}
            <Path
              d={COOL_PATH}
              stroke={COOL_COLOR}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.95}
            />
            {/* Warm arc (right, orange) */}
            <Path
              d={WARM_PATH}
              stroke={WARM_COLOR}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity={0.95}
            />
          </Svg>
          {/* Thumb (animated, follows currentAngle) */}
          <Animated.View
            style={[styles.thumbOuter, thumbStyle]}
            pointerEvents="none"
          >
            <View style={[styles.thumb, { borderColor: primaryColor }, Shadows.card as object]} />
          </Animated.View>

          {/* Inner frosted disk */}
          <View style={[styles.frostedDisk, diskShadow as object]}>
            <GlassView style={styles.diskGlass}>
              <Text style={[styles.targetLabel, { color: primaryColor }]}>
                TARGET {value}°
              </Text>
              <View style={styles.tempRow}>
                <Text style={[styles.tempValue, { color: textColor }]}>{value}</Text>
                <Text style={[styles.tempUnit, { color: textColor }]}>°C</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isHeating ? WARM_COLOR : COOL_COLOR },
                ]}
              >
                <IconSymbol
                  name={isHeating ? 'local_fire_department' : 'ac_unit'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.statusText}>
                  {isHeating ? 'HEATING' : 'COOLING'}
                </Text>
              </View>
            </GlassView>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dialWrapper: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOuter: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  frostedDisk: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    overflow: 'hidden',
  },
  diskGlass: {
    flex: 1,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tempValue: {
    fontSize: 56,
    fontWeight: '700',
    fontFamily: Typography.bold,
    lineHeight: 60,
  },
  tempUnit: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Typography.bold,
    paddingBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
