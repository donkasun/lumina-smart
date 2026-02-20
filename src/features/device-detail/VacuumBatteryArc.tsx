import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const CX = 60;
const CY = 60;
const R = 52;
const STROKE = 10;

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const createArcPath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepAngle: number
): string => {
  if (Math.abs(sweepAngle) < 0.01) return '';
  const clampedSweep = Math.min(Math.abs(sweepAngle), 179.999) * Math.sign(sweepAngle);
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, startAngle + clampedSweep);
  const largeArc = Math.abs(clampedSweep) > 180 ? 1 : 0;
  const sweep = clampedSweep > 0 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

// Track: full bottom half-circle from 180° (left) to 0° (right), same path the fill uses
const TRACK_PATH = createArcPath(CX, CY, R, 180, -180);

interface VacuumBatteryArcProps {
  value: number; // 0–100
  status: 'DOCKED' | 'CLEANING' | 'RETURNING';
}

const batteryColor = (v: number) => {
  if (v > 50) return '#34D399'; // green
  if (v > 20) return '#FBBF24'; // yellow
  return '#F87171'; // red
};

const statusColor = (s: VacuumBatteryArcProps['status']) => {
  if (s === 'CLEANING') return '#34D399';
  if (s === 'RETURNING') return '#FBBF24';
  return undefined; // DOCKED uses subtextColor
};

export const VacuumBatteryArc: React.FC<VacuumBatteryArcProps> = ({ value, status }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const clampedValue = Math.max(0, Math.min(100, value));
  const fillSweep = (clampedValue / 100) * 180; // 0–180°, same direction as track
  const fillPath = fillSweep > 0 ? createArcPath(CX, CY, R, 180, -fillSweep) : '';

  const arcColor = batteryColor(clampedValue);
  const sBadgeColor = statusColor(status);

  return (
    <View style={styles.container}>
      <Svg width={120} height={70} viewBox="0 0 120 70">
        <Path
          d={TRACK_PATH}
          stroke="rgba(150,160,170,0.25)"
          strokeWidth={STROKE}
          strokeLinecap="butt"
          fill="none"
        />
        {fillPath ? (
          <Path
            d={fillPath}
            stroke={arcColor}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            fill="none"
          />
        ) : null}
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentValue, { color: textColor }]}>{clampedValue}</Text>
        <Text style={[styles.percentUnit, { color: subtextColor }]}>%</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          sBadgeColor ? { backgroundColor: `${sBadgeColor}22` } : { backgroundColor: 'rgba(150,160,170,0.12)' },
        ]}
      >
        <Text style={[styles.statusText, { color: sBadgeColor ?? subtextColor }]}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -8,
  },
  percentValue: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Typography.bold,
    lineHeight: 36,
  },
  percentUnit: {
    fontSize: 16,
    fontFamily: Typography.bold,
    paddingBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
