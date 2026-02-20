import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Line, Path, Svg } from 'react-native-svg';
import { createArcPath } from './arcUtils';

const CX = 140;
const CY = 150;
const R = 100;
const STROKE = 10;
const NEEDLE_LENGTH = 82;
const VIEWBOX_WIDTH = 280;
const VIEWBOX_HEIGHT = 160;
const VIEWBOX_Y_MIN = 50;
const VIEWBOX_CONTENT_HEIGHT = 100;

const TRACK_PATH = createArcPath(CX, CY, R, 180, 180, true);
const GREEN_PATH = createArcPath(CX, CY, R, 180, 45.5, true);
const YELLOW_PATH = createArcPath(CX, CY, R, 225, 45.5, true);
const ORANGE_PATH = createArcPath(CX, CY, R, 270, 45.5, true);
const RED_PATH = createArcPath(CX, CY, R, 315, 45, true);

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function getAqiLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: 'Good', color: '#34D399' };
  if (aqi <= 100) return { label: 'Moderate', color: '#FBBF24' };
  if (aqi <= 150) return { label: 'Unhealthy', color: '#FF7D54' };
  return { label: 'Very Unhealthy', color: '#EF4444' };
}

interface AqiGaugeProps {
  aqi: number;
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ aqi }) => {
  const needleAngle = useSharedValue(180);
  const subtextColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    const target = 180 + (aqi / 200) * 180;
    needleAngle.value = withDelay(
      200,
      withTiming(target, { duration: 1400, easing: Easing.out(Easing.cubic) })
    );
  }, [aqi, needleAngle]);

  const needleProps = useAnimatedProps(() => {
    'worklet';
    const rad = (needleAngle.value * Math.PI) / 180;
    return {
      x2: String((CX + NEEDLE_LENGTH * Math.cos(rad)).toFixed(2)),
      y2: String((CY + NEEDLE_LENGTH * Math.sin(rad)).toFixed(2)),
    };
  });

  const { label, color } = getAqiLabel(aqi);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeSvgWrap}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 ${VIEWBOX_Y_MIN} ${VIEWBOX_WIDTH} ${VIEWBOX_CONTENT_HEIGHT}`}
          preserveAspectRatio="xMidYMax meet"
        >
          <Path
            d={TRACK_PATH}
            stroke={borderColor}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            fill="none"
          />
          <Path d={GREEN_PATH} stroke="#34D399" strokeWidth={STROKE} strokeLinecap="butt" fill="none" />
          <Path d={YELLOW_PATH} stroke="#FBBF24" strokeWidth={STROKE} strokeLinecap="butt" fill="none" />
          <Path d={ORANGE_PATH} stroke="#FF7D54" strokeWidth={STROKE} strokeLinecap="butt" fill="none" />
          <Path d={RED_PATH} stroke="#EF4444" strokeWidth={STROKE} strokeLinecap="butt" fill="none" />

          <Line x1={String(CX)} y1={String(CY)} x2={String(CX)} y2={String(CY)} stroke="transparent" strokeWidth={2} />
          <AnimatedLine
            x1={String(CX)}
            y1={String(CY)}
            animatedProps={needleProps}
            stroke={textColor}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <Line
            x1={String(CX - 0.01)}
            y1={String(CY)}
            x2={String(CX + 0.01)}
            y2={String(CY)}
            stroke={textColor}
            strokeWidth={12}
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <View style={styles.labelContainer}>
        <Text style={[styles.aqiNumber, { color }]}>{aqi}</Text>
        <Text style={[styles.aqiLabel, { color }]}>{label}</Text>
        <Text style={[styles.caption, { color: subtextColor }]}>Current Air Quality Index</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  gaugeSvgWrap: {
    width: '100%',
    height: VIEWBOX_HEIGHT,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  aqiNumber: {
    fontSize: 48,
    fontFamily: Typography.bold,
    fontWeight: '700',
    lineHeight: 52,
    textAlign: 'center',
  },
  aqiLabel: {
    fontSize: 14,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  caption: {
    fontSize: 12,
    fontFamily: Typography.medium,
    marginTop: 8,
    textAlign: 'center',
  },
});
