import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const SprinklerIcon =
  require('../../../assets/icons/sprinkler.svg')?.default ??
  require('../../../assets/icons/sprinkler.svg');

const ZONES = [
  { id: 'front', name: 'Front Lawn', subtitle: 'Next: 6:00 AM', iconColor: '#10B981' },
  { id: 'veg', name: 'Vegetable Patch', subtitle: 'Moisture: Low', iconColor: '#F97316' },
  { id: 'back', name: 'Back Garden', subtitle: 'Idle', iconColor: '#3B82F6' },
];

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface SprinklerDetailProps {
  device: Device;
}

export const SprinklerDetail: React.FC<SprinklerDetailProps> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);
  const [zoneOn, setZoneOn] = useState<Record<string, boolean>>({ veg: true });
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const cardBg = surfaceColor;
  const iconColor = device.isOn ? '#0D9488' : subtextColor;

  const SprinklerImage = device.image ?? SprinklerIcon;
  const IconComponent = SprinklerImage?.default ?? SprinklerImage;

  return (
    <View style={styles.section}>
      {/* Top device card with on/off toggler (like PurifierDetail) */}
      <GlassCard style={[styles.deviceCard, { backgroundColor: cardBg }]}>
        <View style={[styles.deviceIconWrap, { backgroundColor: device.isOn ? 'rgba(13,148,136,0.15)' : 'rgba(107,114,128,0.12)' }]}>
          {typeof IconComponent === 'function' ? (
            <IconComponent width={40} height={40} color={iconColor} />
          ) : (
            <Image source={SprinklerImage} style={styles.deviceIcon} resizeMode="contain" />
          )}
        </View>
        <View style={styles.deviceNameWrap}>
          <Text style={[styles.deviceName, { color: textColor }]} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={[styles.deviceSub, { color: subtextColor }]} numberOfLines={1}>
            {device.isOn ? 'System active' : 'Off'}
          </Text>
        </View>
        <AnimatedToggle value={device.isOn} onChange={() => toggleDevice(device.id)} />
      </GlassCard>

      {/* Rain delay status */}
      <GlassCard style={[styles.statusCard, { backgroundColor: cardBg }]}>
        <View style={styles.statusIconCircle}>
          <IconSymbol name="drop.fill" size={48} color="#3B82F6" />
        </View>
        <Text style={[styles.statusTitle, { color: textColor }]}>Rain Delay Active</Text>
        <Text style={[styles.statusSubtitle, { color: subtextColor }]}>
          Skipped due to 15mm rainfall
        </Text>
      </GlassCard>

      {/* Active Zones */}
      <Text style={[styles.sectionLabel, { color: subtextColor }]}>ACTIVE ZONES</Text>
      <View style={styles.zoneList}>
        {ZONES.map((zone) => (
          <GlassCard key={zone.id} style={[styles.zoneCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.zoneIconCircle, { backgroundColor: `${zone.iconColor}20` }]}>
              <IconSymbol name="eco" size={22} color={zone.iconColor} />
            </View>
            <View style={styles.zoneTextWrap}>
              <Text style={[styles.zoneName, { color: textColor }]}>{zone.name}</Text>
              <Text style={[styles.zoneSubtitle, { color: subtextColor }]}>{zone.subtitle}</Text>
            </View>
            <AnimatedToggle
              value={zoneOn[zone.id] ?? false}
              onChange={() => setZoneOn((p) => ({ ...p, [zone.id]: !p[zone.id] }))}
            />
          </GlassCard>
        ))}
      </View>

      {/* Water Savings */}
      <Text style={[styles.sectionLabel, { color: subtextColor }]}>WATER SAVINGS</Text>
      <GlassCard style={[styles.waterCard, { backgroundColor: cardBg }]}>
        <View style={styles.waterHeader}>
          <View>
            <Text style={[styles.waterValue, { color: textColor }]}>450</Text>
            <Text style={[styles.waterUnit, { color: subtextColor }]}>Liters</Text>
          </View>
          <View style={styles.waterPeriodWrap}>
            <Text style={[styles.waterPeriodBtn, { color: subtextColor }]}>Weekly</Text>
            <IconSymbol name="chevron.right" size={14} color={subtextColor} />
          </View>
        </View>
        <Text style={styles.waterChange}>+12% vs last week</Text>
        <View style={styles.chartPlaceholder}>
          <View style={[styles.chartBar, { height: '40%' }]} />
          <View style={[styles.chartBar, { height: '65%' }]} />
          <View style={[styles.chartBar, { height: '55%' }]} />
          <View style={[styles.chartBar, { height: '80%', backgroundColor: '#3B82F6' }]} />
          <View style={[styles.chartBar, { height: '70%' }]} />
          <View style={[styles.chartBar, { height: '50%' }]} />
          <View style={[styles.chartBar, { height: '45%' }]} />
        </View>
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((d, i) => (
            <Text key={i} style={[styles.weekdayLabel, { color: i === 3 ? '#3B82F6' : subtextColor }]}>
              {d}
            </Text>
          ))}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deviceIcon: {
    width: 40,
    height: 40,
  },
  deviceNameWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 12,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  deviceSub: {
    fontSize: 13,
    fontFamily: Typography.regular,
    marginTop: 2,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  statusIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 13,
    fontFamily: Typography.regular,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: Typography.bold,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  zoneList: {
    gap: 10,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  zoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneTextWrap: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  zoneName: {
    fontSize: 15,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  zoneSubtitle: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  waterCard: {
    padding: 16,
    gap: 8,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  waterValue: {
    fontSize: 28,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  waterUnit: {
    fontSize: 14,
    fontFamily: Typography.regular,
  },
  waterPeriodWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waterPeriodBtn: {
    fontSize: 12,
    fontFamily: Typography.semiBold,
  },
  waterChange: {
    fontSize: 13,
    fontFamily: Typography.semiBold,
    color: '#10B981',
  },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    marginTop: 8,
    gap: 4,
  },
  chartBar: {
    flex: 1,
    backgroundColor: 'rgba(148,163,184,0.35)',
    borderRadius: 4,
    minHeight: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: Typography.semiBold,
  },
});
