import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { AqiGauge } from './AqiGauge';
import { ParticleField } from './ParticleField';
import { PollutantBars } from './PollutantBars';

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
  if (sweepAngle <= 0) return '';
  const clampedSweep = Math.min(sweepAngle, 359.999);
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, startAngle + clampedSweep);
  const largeArc = clampedSweep > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

const RING_CX = 60;
const RING_CY = 60;
const RING_R = 50;
const RING_START = 140;
const RING_TOTAL = 280;
const FILTER_PCT = 0.72;

const RING_TRACK_PATH = createArcPath(RING_CX, RING_CY, RING_R, RING_START, RING_TOTAL);
const RING_FILL_PATH = createArcPath(
  RING_CX,
  RING_CY,
  RING_R,
  RING_START,
  FILTER_PCT * RING_TOTAL
);

const SPEEDS = ['auto', 'low', 'mid', 'high'] as const;
type Speed = (typeof SPEEDS)[number];
const SPEED_LABELS: Record<Speed, string> = {
  auto: 'Auto',
  low: 'Low',
  mid: 'Mid',
  high: 'High',
};

interface PurifierDetailProps {
  device: Device;
}

const normalizeSpeed = (mode: string | undefined): Speed => {
  if (mode === 'medium') return 'mid';
  if (mode === 'auto' || mode === 'low' || mode === 'mid' || mode === 'high') return mode;
  return 'auto';
};

export const PurifierDetail: React.FC<PurifierDetailProps> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);
  const [speed, setSpeed] = useState<Speed>(normalizeSpeed(device.mode));
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const accentColor = useThemeColor({}, 'tint');
  const aqi = device.value;

  const purifierImage = device.image ?? require('../../../assets/images/air_purifier.png');

  return (
    <View style={styles.section}>
      <GlassCard style={styles.statusCard}>
        <View style={styles.statusIconWrap}>
          <Image source={purifierImage} style={styles.statusIcon} resizeMode="contain" />
        </View>
        <Text style={[styles.statusLabel, { color: device.isOn ? accentColor : subtextColor }]}>
          {device.isOn ? 'ON' : 'OFF'}
        </Text>
        <AnimatedToggle value={device.isOn} onChange={() => toggleDevice(device.id)} />
      </GlassCard>

      <View style={styles.heroContainer}>
        <ParticleField />
        <AqiGauge aqi={aqi} />
      </View>

      <PollutantBars />

      <GlassCard style={styles.fanCard}>
        <Text style={[styles.cardTitle, { color: subtextColor }]}>FAN SPEED</Text>
        <View style={styles.pillRow}>
          {SPEEDS.map((s) => {
            const isActive = s === speed;
            return (
              <Pressable
                key={s}
                onPress={() => setSpeed(s)}
                style={[
                  styles.pill,
                  isActive
                    ? [styles.pillActive, Shadows.primaryUnderglow as object]
                    : styles.pillInactive,
                ]}
              >
                {s === 'auto' ? (
                  <IconSymbol
                    name="auto_mode"
                    size={18}
                    color={isActive ? '#FFFFFF' : subtextColor}
                    style={styles.pillIcon}
                  />
                ) : null}
                <Text
                  style={[
                    styles.pillText,
                    { color: isActive ? '#FFFFFF' : subtextColor },
                  ]}
                >
                  {SPEED_LABELS[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassCard>

      <GlassCard style={styles.filterCard}>
        <View style={styles.filterBody}>
          <View style={styles.ringContainer}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Path
                d={RING_TRACK_PATH}
                stroke="rgba(226,232,240,0.8)"
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={RING_FILL_PATH}
                stroke="#FF7D54"
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <IconSymbol name="wind" size={32} color="#FF7D54" />
            </View>
          </View>
          <View style={styles.filterTextBlock}>
            <Text style={[styles.cardTitle, { color: subtextColor }]}>FILTER STATUS</Text>
            <View style={styles.filterPctRow}>
              <Text style={[styles.filterPct, { color: textColor }]}>72%</Text>
              <Text style={styles.filterHealthy}>HEALTHY</Text>
            </View>
            <Text style={[styles.filterSub, { color: subtextColor }]}>
              ~28 days left until replacement
            </Text>
            <Text style={[styles.filterMetaText, { color: subtextColor }]}>
              Last replaced: Jan 15, 2026
            </Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,125,84,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusIcon: {
    width: 40,
    height: 40,
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  fanCard: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: Typography.bold,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pillActive: {
    backgroundColor: '#FF7D54',
  },
  pillInactive: {
    borderRadius: 12,
    backgroundColor: 'rgba(226,232,240,0.8)',
  },
  pillIcon: {
    marginRight: 0,
  },
  pillText: {
    fontSize: 12,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  filterCard: {
    gap: 12,
  },
  filterBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ringContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTextBlock: {
    flex: 1,
    gap: 2,
  },
  filterPctRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  filterPct: {
    fontSize: 28,
    fontFamily: Typography.bold,
    fontWeight: '700',
    lineHeight: 32,
  },
  filterHealthy: {
    fontSize: 12,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
    color: '#34D399',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterSub: {
    fontSize: 12,
    fontFamily: Typography.regular,
    marginTop: 2,
  },
  filterMetaText: {
    fontSize: 11,
    fontFamily: Typography.regular,
    marginTop: 4,
  },
});
