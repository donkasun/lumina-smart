import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import { haptics } from '@/src/utils/haptics';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { AqiGauge } from './AqiGauge';
import { ParticleField } from './ParticleField';
import { PollutantBars } from './PollutantBars';
import {
  DEFAULT_PURIFIER_ICON,
  PURIFIER_SPEED_LABELS,
  PURIFIER_SPEEDS,
  RING_FILL_PATH,
  RING_TRACK_PATH,
  normalizePurifierSpeed,
  type PurifierSpeed,
} from './purifierConstants';

interface PurifierDetailProps {
  device: Device;
}

function renderSpeedPillIcon(speed: PurifierSpeed, isActive: boolean, subtextColor: string) {
  if (speed !== 'auto') return null;
  return (
    <IconSymbol
      name="auto_mode"
      size={18}
      color={isActive ? '#FFFFFF' : subtextColor}
      style={styles.pillIcon}
    />
  );
}

export const PurifierDetail: React.FC<PurifierDetailProps> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);
  const [speed, setSpeed] = useState<PurifierSpeed>(normalizePurifierSpeed(device.mode));
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const accentColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const aqi = device.value;

  const purifierImage = device.image ?? DEFAULT_PURIFIER_ICON;
  const iconColor = device.isOn ? accentColor : subtextColor;
  const IconComponent = purifierImage?.default ?? purifierImage;

  return (
    <View style={styles.section}>
      <GlassCard style={styles.statusCard}>
        <View style={styles.statusIconWrap}>
          {typeof IconComponent === 'function' ? (
            <IconComponent width={40} height={40} color={iconColor} />
          ) : (
            <Image source={purifierImage} style={styles.statusIcon} resizeMode="contain" />
          )}
        </View>
        <View style={styles.brandModelWrap}>
          <Text style={[styles.brandName, { color: textColor }]} numberOfLines={1}>
            {device.brand ?? 'Lumina'}
          </Text>
          <Text style={[styles.modelLine, { color: subtextColor }]} numberOfLines={1}>
            {device.model ?? device.name}
            {' · '}
            <Text style={styles.fanSpeedInline}>{PURIFIER_SPEED_LABELS[speed]}</Text>
          </Text>
          {device.batteryLevel != null && (
            <View style={styles.batteryLine}>
              <Text style={[styles.batteryPercent, { color: textColor }]}>
                {device.batteryLevel}%
              </Text>
              <IconSymbol
                name="battery.75percent"
                size={16}
                color={subtextColor}
                style={styles.batteryIcon}
              />
            </View>
          )}
        </View>
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
          {PURIFIER_SPEEDS.map((s) => {
            const isActive = s === speed;
            return (
              <Pressable
                key={s}
                onPress={() => {
                  haptics.tap();
                  setSpeed(s);
                }}
                style={[
                  styles.pill,
                  isActive
                    ? [styles.pillActive, Shadows.primaryUnderglow as object]
                    : [styles.pillInactive, { backgroundColor: borderColor }],
                ]}
              >
                {renderSpeedPillIcon(s, isActive, subtextColor)}
                <Text
                  style={[styles.pillText, { color: isActive ? '#FFFFFF' : subtextColor }]}
                >
                  {PURIFIER_SPEED_LABELS[s]}
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
  brandModelWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  brandName: {
    fontSize: 16,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  modelLine: {
    fontSize: 13,
    fontFamily: Typography.medium,
    marginTop: 2,
  },
  fanSpeedInline: {
    fontFamily: Typography.semiBold,
  },
  batteryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  batteryPercent: {
    fontSize: 13,
    fontFamily: Typography.semiBold,
  },
  batteryIcon: {
    marginLeft: 0,
  },
  heroContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
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
