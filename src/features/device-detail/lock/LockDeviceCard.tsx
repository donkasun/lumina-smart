import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const LockIconSvg =
  require('../../../../assets/icons/door-lock.svg')?.default ?? require('../../../../assets/icons/door-lock.svg');

interface LockDeviceCardProps {
  device: Device;
  lockAccent: string;
  isExternal: boolean;
  cardBg: string;
  textColor: string;
  subtextColor: string;
}

export function LockDeviceCard({
  device,
  lockAccent,
  isExternal,
  cardBg,
  textColor,
  subtextColor,
}: LockDeviceCardProps) {
  const setDeviceOn = useDeviceStore((s) => s.setDeviceOn);
  const batteryPct = device.batteryLevel ?? 82;
  const powerOn = device.isOn;
  const locked = device.type === 'lock' ? device.value === 1 : device.isOn;
  const LockIcon = device.image ?? LockIconSvg;
  const LockIconComponent = LockIcon?.default ?? LockIcon;
  const iconName = isExternal ? 'lock.fill' : 'door.front.door';
  const iconColor = locked ? lockAccent : subtextColor;

  return (
    <GlassCard style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={[styles.iconWrap, { backgroundColor: locked ? `${lockAccent}20` : `${subtextColor}15` }]}>
        {typeof LockIconComponent === 'function' ? (
          <LockIconComponent width={32} height={32} color={iconColor} />
        ) : (
          <IconSymbol name={iconName} size={32} color={iconColor} />
        )}
      </View>
      <View style={styles.nameWrap}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {device.name}
        </Text>
        <Text style={[styles.sub, { color: subtextColor }]}>
          Battery {batteryPct}% · {powerOn ? 'On' : 'Off'} · {locked ? 'Locked' : 'Unlocked'}
        </Text>
      </View>
      <AnimatedToggle
        value={powerOn}
        onChange={() => setDeviceOn(device.id, !powerOn)}
        activeColor={lockAccent}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 32,
    gap: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  sub: {
    fontSize: 14,
    fontFamily: Typography.medium,
  },
});
