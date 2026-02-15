import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Svg, Path, Circle } from 'react-native-svg';
import { GlassView } from '@/src/components/ui/GlassView';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const DIAL_SIZE = 280;
const CENTER = DIAL_SIZE / 2;
const RADIUS = 120;
const STROKE_WIDTH = 16;

const WARM_COLOR = '#FF7D54';
const COOL_COLOR = '#3B82F6';

// Polar helpers (same as CircularSlider)
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
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

// Arc: total 300°, gap 60° at bottom
// Warm half: -210° → -60° (150° sweep)
// Cool half: -60° → +90° (150° sweep)
const WARM_PATH = createArcPath(CENTER, CENTER, RADIUS, -210, 150);
const COOL_PATH = createArcPath(CENTER, CENTER, RADIUS, -60, 150);

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

  // Map value to angle within the 300° arc
  // Arc goes from -210° to +90°, total 300°
  const valueToAngle = (v: number) => {
    const normalized = (v - min) / (max - min);
    return -210 + normalized * 300;
  };

  const angleToValue = (angle: number) => {
    const normalized = (angle + 210) / 300;
    const clamped = Math.max(0, Math.min(1, normalized));
    return Math.round(min + clamped * (max - min));
  };

  const currentAngle = useSharedValue(valueToAngle(value));
  const currentValue = useSharedValue(value);

  const updateValue = useCallback(
    (v: number) => {
      if (onChange) onChange(v);
    },
    [onChange]
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const dx = e.x - CENTER;
      const dy = e.y - CENTER;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      // Clamp to arc range
      if (angle < -210) angle = -210;
      if (angle > 90) angle = 90;
      currentAngle.value = angle;
      currentValue.value = angleToValue(angle);
    })
    .onEnd(() => {
      runOnJS(updateValue)(currentValue.value);
    });

  const knobPos = polarToCartesian(CENTER, CENTER, RADIUS, valueToAngle(value));

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
      <GestureDetector gesture={pan}>
        <View style={styles.dialWrapper}>
          <Svg width={DIAL_SIZE} height={DIAL_SIZE}>
            {/* Warm arc */}
            <Path
              d={WARM_PATH}
              stroke={WARM_COLOR}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              fill="none"
              opacity={0.9}
            />
            {/* Cool arc */}
            <Path
              d={COOL_PATH}
              stroke={COOL_COLOR}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              fill="none"
              opacity={0.9}
            />
            {/* Knob */}
            <Circle
              cx={knobPos.x}
              cy={knobPos.y}
              r={12}
              fill="#FFFFFF"
              stroke={primaryColor}
              strokeWidth={2}
            />
          </Svg>

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
                  { backgroundColor: isHeating ? '#FF7D54' : '#3B82F6' },
                ]}
              >
                <Text style={styles.statusText}>
                  {isHeating ? '● HEATING' : '● COOLING'}
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
    gap: 4,
    padding: 16,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
});
