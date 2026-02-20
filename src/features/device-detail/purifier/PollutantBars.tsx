import React, { useEffect } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';

export const POLLUTANTS = [
  { label: 'PM2.5', value: 12, max: 75, unit: 'µg/m³' },
  { label: 'PM10', value: 24, max: 150, unit: 'µg/m³' },
  { label: 'CO2', value: 412, max: 2000, unit: 'ppm' },
  { label: 'VOC', value: 0.2, max: 3, unit: 'mg/m³' },
  { label: 'Humidity', value: 48, max: 100, unit: '%' },
] as const;

const HUMIDITY_BAR_COLOR = '#3B82F6';

function fillColor(pct: number, isHumidity: boolean): string {
  if (isHumidity) return HUMIDITY_BAR_COLOR;
  if (pct < 0.5) return '#34D399';
  if (pct < 0.75) return '#FBBF24';
  return '#EF4444';
}

interface PollutantRowProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  isHumidity?: boolean;
}

function PollutantRow({ label, value, max, unit, isHumidity = false }: PollutantRowProps) {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const pct = value / max;
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1000 });
  }, [progress]);

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
  };

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * pct * trackWidth.value,
  }));

  const valueText =
    typeof value === 'number' && value < 1 ? value.toFixed(1) : String(value);

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={[styles.rowLabel, { color: subtextColor }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: textColor }]}>
          {valueText} {unit}
        </Text>
      </View>
      <View style={[styles.trackWrapper, { backgroundColor: borderColor }]} onLayout={handleLayout}>
        <View style={[styles.track, { backgroundColor: borderColor }]} />
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: fillColor(pct, isHumidity) },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

export const PollutantBars: React.FC = () => {
  const subtextColor = useThemeColor({}, 'icon');

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: subtextColor }]}>AIR QUALITY</Text>
        <Pressable hitSlop={8} onPress={() => {}} style={styles.infoButton}>
          <IconSymbol name="info.outline" size={20} color={subtextColor} />
        </Pressable>
      </View>
      {POLLUTANTS.map((p) => (
        <PollutantRow
          key={p.label}
          label={p.label}
          value={p.value}
          max={p.max}
          unit={p.unit}
          isHumidity={p.label === 'Humidity'}
        />
      ))}
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
  sectionTitle: {
    fontSize: 10,
    fontFamily: Typography.bold,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  infoButton: {
    padding: 4,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 12,
    fontFamily: Typography.medium,
  },
  rowValue: {
    fontSize: 11,
    fontFamily: Typography.medium,
  },
  trackWrapper: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  track: {
    ...StyleSheet.absoluteFillObject,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
});
