import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassView } from '@/src/components/ui/GlassView';
import { haptics } from '@/src/utils/haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

const DIAL_SIZE = 280;
const CENTER = DIAL_SIZE / 2;
const RADIUS = 120;
const STROKE_WIDTH = 16;

// Hot/warm = orange (right side of dial), Cold/cool = blue (left side)
const WARM_COLOR = '#FF7D54';
const COOL_COLOR = '#3B82F6';

// Arc symmetric around top (12 o'clock): -240° (11 o'clock) to +60° (1 o'clock), 300° total, 60° gap at bottom
// atan2 returns (-180, 180]. Cool end -240° = 120° in atan2; warm end 60° = 60°. So (60, 180] is the left/cool side.
const ARC_START = -240;
const ARC_END = 60;
const ARC_SWEEP = ARC_END - ARC_START; // 300
const ARC_HALF = 150; // each segment 150°
const ATAN2_COOL_END = 120; // 11 o'clock = -240° = 120° in atan2

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

  // Display value = virtual room temp; only ticks by 1 every 1s after user stops, never during slide
  const [displayValue, setDisplayValue] = useState(value);
  // Target value = setpoint; updates live during slide for TARGET label and badge
  const [targetValue, setTargetValue] = useState(value);
  const currentAngle = useSharedValue(valueToAngle(value));
  const currentValue = useSharedValue(value);
  const lastHapticValue = useSharedValue(Math.round(value));
  const prevValueRef = useRef<number | undefined>(undefined);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    currentAngle.value = valueToAngle(value);
    currentValue.value = value;
    lastHapticValue.value = Math.round(value);
    setTargetValue(value);
  }, [value, valueToAngle, currentAngle, currentValue, lastHapticValue]);

  // When user stops: tick display value by 1 every 1s toward target (mimics thermostat)
  useEffect(() => {
    if (prevValueRef.current !== undefined && prevValueRef.current !== value) {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      const step = value > displayValue ? 1 : -1;
      if (displayValue !== value) {
        tickIntervalRef.current = setInterval(() => {
          setDisplayValue((prev) => {
            const next = prev + step;
            if ((step > 0 && next >= value) || (step < 0 && next <= value)) {
              if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current);
                tickIntervalRef.current = null;
              }
              return value;
            }
            return next;
          });
        }, 2500);
      } else {
        setDisplayValue(value);
      }
    }
    prevValueRef.current = value;
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
    // Only run when value changes; displayValue read at start of effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
      let raw = (Math.atan2(dy, dx) * 180) / Math.PI;
      let angle = raw;
      if (raw >= ATAN2_COOL_END && raw <= 180) {
        // Cool side (11 o'clock to 9 o'clock)
        angle = ARC_START + (raw - ATAN2_COOL_END);
      } else if (raw > 60 && raw < ATAN2_COOL_END) {
        // Gap (1 o'clock to 11 o'clock): stay on current side, don't jump to the other end
        const onWarmSide = currentAngle.value >= -90;
        angle = onWarmSide ? ARC_END : ARC_START;
      } else {
        // Main arc (9 o'clock to 1 o'clock): -180 to 60
        angle = Math.max(ARC_START, Math.min(ARC_END, raw));
      }
      currentAngle.value = angle;
      const normalized = (angle - ARC_START) / ARC_SWEEP;
      const clamped = Math.max(0, Math.min(1, normalized));
      const v = Math.round(min + clamped * (max - min));
      currentValue.value = v;
      const rounded = Math.round(v);
      if (rounded !== lastHapticValue.value) {
        lastHapticValue.value = rounded;
        runOnJS(setTargetValue)(rounded);
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
      let raw = (Math.atan2(dy, dx) * 180) / Math.PI;
      let angle = raw;
      if (raw > 60 && raw <= 180) {
        angle = ARC_START + (raw - ATAN2_COOL_END);
      } else {
        angle = Math.max(ARC_START, Math.min(ARC_END, raw));
      }
      const normalized = (angle - ARC_START) / ARC_SWEEP;
      const clamped = Math.max(0, Math.min(1, normalized));
      const newTarget = Math.round(min + clamped * (max - min));
      currentValue.value = newTarget;
      lastHapticValue.value = newTarget;
      runOnJS(setTargetValue)(newTarget);
      runOnJS(triggerDegreeHaptic)();
      currentAngle.value = withTiming(angle, {
        duration: TAP_ANIM_DURATION,
      }, (finished) => {
        if (finished) {
          runOnJS(updateValue)(newTarget);
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

  const isHeating = targetValue > 21;
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <View style={styles.dialWrapper}>
          {/* Cold icon (top left) */}
          <View style={styles.arcIconLeft} pointerEvents="none">
            <IconSymbol name="ac_unit" size={36} color={COOL_COLOR} />
          </View>
          {/* Warm icon (top right) */}
          <View style={styles.arcIconRight} pointerEvents="none">
            <IconSymbol name="local_fire_department" size={36} color={WARM_COLOR} />
          </View>
          <View style={styles.arcContainer}>
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
                opacity={1}
              />
            </Svg>
          </View>
          {/* Thumb (animated, follows currentAngle) — no shadow to avoid casting onto inner circle */}
          <Animated.View
            style={[styles.thumbOuter, thumbStyle]}
            pointerEvents="none"
          >
            <View style={[styles.thumb, { borderColor: primaryColor }]} />
          </Animated.View>

          {/* Inner circle: shadow wrapper so shadow isn't clipped; inner clips content */}
          <View style={[styles.diskShadowWrapper, diskShadow as object]}>
            <View style={styles.frostedDisk}>
              <GlassView style={styles.diskGlass}>
              <Text style={[styles.targetLabel, { color: primaryColor }]}>
                TARGET {targetValue}°
              </Text>
              <View style={[styles.divider, { backgroundColor: borderColor }]} />
              <View style={styles.tempRow}>
                <Text style={[styles.tempValue, { color: textColor }]}>{displayValue}</Text>
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
  arcIconLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
  },
  arcIconRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  arcContainer: {
    ...(Platform.OS === 'ios'
      ? { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 } }
      : { elevation: 0 }),
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
  diskShadowWrapper: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frostedDisk: {
    width: '100%',
    height: '100%',
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
  divider: {
    height: 1,
    alignSelf: 'stretch',
    marginVertical: 4,
    opacity: 0.5,
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
