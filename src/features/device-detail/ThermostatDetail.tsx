import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import { haptics } from '@/src/utils/haptics';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FanSpeedSlider } from './FanSpeedSlider';
import { ModeButton } from './ModeButton';
import { ThermostatDial } from './ThermostatDial';
import { PRIMARY } from './constants';

const MODES = [
  { key: 'heat', icon: 'local_fire_department', label: 'Heat' },
  { key: 'cool', icon: 'ac_unit', label: 'Cool' },
  { key: 'auto', icon: 'autorenew', label: 'Auto' },
  { key: 'eco', icon: 'eco', label: 'Eco' },
];

export const ThermostatDetail: React.FC<{ device: Device }> = ({ device }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const updateDeviceValue = useDeviceStore((s) => s.updateDeviceValue);
  const scheduleIconOpacity = colorScheme === 'dark' ? 0.15 : 0.05;

  const [activeMode, setActiveMode] = React.useState<string>('heat');
  const [fanIndex, setFanIndex] = React.useState(2);

  const handleTempChange = useCallback(
    (v: number) => updateDeviceValue(device.id, v),
    [device.id, updateDeviceValue]
  );

  return (
    <View style={styles.section}>
      <ThermostatDial value={device.value} onChange={handleTempChange} />
      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <ModeButton
            key={m.key}
            icon={m.icon}
            label={m.label}
            isActive={activeMode === m.key}
            onPress={() => {
              haptics.tap();
              setActiveMode(m.key);
            }}
          />
        ))}
      </View>
      <FanSpeedSlider value={fanIndex} onChange={setFanIndex} />
      <View style={styles.infoRow}>
        <GlassCard style={styles.infoCardRow}>
          <View style={styles.infoCardLeft}>
            <View style={[styles.infoIconCircle, styles.infoIconCircleBlue]}>
              <IconSymbol name="humidity_mid" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.infoLabel, { color: subtextColor }]}>Humidity</Text>
          </View>
          <View style={styles.infoCardContent}>
            <Text style={[styles.infoValueSmall, { color: textColor }]}>62% <Text style={[styles.infoValueSmall, { color: subtextColor }]}>out</Text></Text>
            <View style={[styles.infoDivider, { backgroundColor: borderColor }]} />
            <Text style={[styles.infoValue, { color: textColor }]}>45% <Text style={[styles.infoValueSmall, { color: subtextColor }]}>in</Text></Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.infoCardRow}>
          <View style={styles.infoCardLeft}>
            <View style={[styles.infoIconCircle, styles.infoIconCirclePrimary]}>
              <IconSymbol name="thermometer.medium" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.infoLabel, { color: subtextColor }]}>Outside</Text>
          </View>
          <View style={styles.infoCardContent}>
            <Text style={[styles.infoValue, { color: textColor }]}>24°C</Text>
          </View>
        </GlassCard>
      </View>
      <View style={styles.scheduleRow}>
        <GlassCard style={styles.scheduleCard}>
          <View style={[styles.scheduleIconBg, { opacity: scheduleIconOpacity }]}>
            <IconSymbol name="calendar_today" size={36} color={PRIMARY} />
          </View>
          <Text style={[styles.infoValue, { color: textColor }]}>20:30</Text>
          <Text style={[styles.scheduleTemp, { color: PRIMARY }]}>20°C</Text>
          <Text style={[styles.infoLabel, { color: subtextColor }]}>Next</Text>
        </GlassCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCardRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  infoCardLeft: {
    alignItems: 'center',
    gap: 6,
  },
  infoCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  infoDivider: {
    alignSelf: 'stretch',
    height: 1,
    opacity: 0.6,
    marginVertical: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
  },
  scheduleCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconCircleBlue: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  infoIconCirclePrimary: {
    backgroundColor: 'rgba(255,125,84,0.15)',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  infoValueSmall: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.bold,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  scheduleIconBg: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.05,
  },
  scheduleTemp: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
});
