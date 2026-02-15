import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/src/utils/haptics';
import React, { useRef } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

interface CircularSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  unit?: string;
  label?: string;
  step?: number;
  size?: number;
}

const { width } = Dimensions.get('window');
const DEFAULT_SIZE = Math.min(width - 80, 280);

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

const knobShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.19,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
}) ?? {};

export const CircularSlider: React.FC<CircularSliderProps> = ({
  min,
  max,
  value,
  onChange,
  onChangeEnd,
  unit = '',
  label = '',
  step = 1,
  size = DEFAULT_SIZE,
}) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const lastHapticValue = useRef(value);
  const rotation = useSharedValue(((value - min) / (max - min)) * 270 - 135);

  const center = size / 2;
  const radius = size / 2 - 30;
  const strokeWidth = 12;

  const triggerHaptic = (newValue: number) => {
    const threshold = max > 100 ? 5 : 1;
    if (Math.abs(newValue - lastHapticValue.current) >= threshold) {
      haptics.tap();
      lastHapticValue.current = newValue;
    }
  };

  const calculateValueFromAngle = (angle: number) => {
    'worklet';
    let normalized = (angle + 135) / 270;
    normalized = Math.max(0, Math.min(1, normalized));
    let rawValue = min + normalized * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const x = e.x - center;
      const y = e.y - center;
      let angle = (Math.atan2(y, x) * 180) / Math.PI;

      if (angle < -135) angle = -135;
      if (angle > 135) angle = 135;

      rotation.value = angle;
      const newValue = calculateValueFromAngle(angle);
      runOnJS(onChange)(newValue);
      runOnJS(triggerHaptic)(newValue);
    })
    .onEnd(() => {
      const newValue = calculateValueFromAngle(rotation.value);
      if (onChangeEnd) {
        runOnJS(onChangeEnd)(newValue);
      }
    });

  const knobStyle = useAnimatedStyle(() => {
    const angleRad = (rotation.value * Math.PI) / 180;
    const x = center + Math.cos(angleRad) * radius;
    const y = center + Math.sin(angleRad) * radius;

    return {
      transform: [
        { translateX: x - 20 },
        { translateY: y - 20 },
      ],
    };
  });

  const backgroundPath = createArcPath(center, center, radius, -135, 270);
  const progressSweep = 270 * ((value - min) / (max - min));
  const progressPath = createArcPath(center, center, radius, -135, progressSweep);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}

      <GestureDetector gesture={pan}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            {/* Background track */}
            <Path
              d={backgroundPath}
              stroke={surfaceColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* Progress track */}
            {progressPath !== '' && (
              <Path
                d={progressPath}
                stroke={accentColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
              />
            )}
          </Svg>

          {/* Center value display */}
          <View style={[styles.valueContainer, { width: size, height: size }]}>
            <Text style={[styles.value, { color: textColor }]}>
              {value}
              <Text style={[styles.unit, { color: subtextColor }]}>{unit}</Text>
            </Text>
          </View>

          {/* Draggable knob */}
          <Animated.View style={[styles.knob, knobStyle]}>
            <View style={[styles.knobOuter, { backgroundColor: accentColor }, knobShadow]}>
              <View style={styles.knobInner} />
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  valueContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 56,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  unit: {
    fontSize: 32,
    fontWeight: '400',
    fontFamily: Typography.regular,
  },
  knob: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
});
