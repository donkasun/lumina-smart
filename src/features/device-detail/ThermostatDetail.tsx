import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FanSpeedSlider } from './FanSpeedSlider';
import { ThermostatDial } from './ThermostatDial';
import { ThermostatInfoCard } from './ThermostatInfoCard';
import { ThermostatModes } from './ThermostatModes';
import { PRIMARY } from './constants';

export const ThermostatDetail: React.FC<{ device: Device }> = ({ device }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const updateDeviceValue = useDeviceStore((s) => s.updateDeviceValue);
  const [activeMode, setActiveMode] = React.useState<string>('heat');
  const [fanIndex, setFanIndex] = React.useState(2);

  const handleTempChange = useCallback(
    (v: number) => updateDeviceValue(device.id, v),
    [device.id, updateDeviceValue]
  );

  return (
    <View style={styles.section}>
      <ThermostatDial value={device.value} onChange={handleTempChange} />
      <ThermostatModes activeMode={activeMode} onModeChange={setActiveMode} />
      <FanSpeedSlider value={fanIndex} onChange={setFanIndex} />
      <View style={styles.infoRow}>
        <ThermostatInfoCard
          iconName="humidity_mid"
          iconVariant="blue"
          label="Humidity"
        >
          <Text style={[styles.infoValueSmall, { color: textColor }]}>
            62% <Text style={[styles.infoValueSmall, { color: subtextColor }]}>out</Text>
          </Text>
          <View style={[styles.infoDivider, { backgroundColor: borderColor }]} />
          <Text style={[styles.infoValue, { color: textColor }]}>
            45% <Text style={[styles.infoValueSmall, { color: subtextColor }]}>in</Text>
          </Text>
        </ThermostatInfoCard>
        <ThermostatInfoCard
          iconName="thermometer.medium"
          iconVariant="primary"
          label="Outside"
        >
          <Text style={[styles.infoValue, { color: textColor }]}>24°C</Text>
        </ThermostatInfoCard>
      </View>
      <View style={styles.scheduleRow}>
        <ThermostatInfoCard
          iconName="calendar_today"
          iconVariant="primary"
          label="Next"
        >
          <View style={styles.scheduleValueRow}>
            <Text style={[styles.scheduleTypeLabel, { color: subtextColor }]}>Daily</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>20:30</Text>
            <View style={[styles.infoDividerVertical, { backgroundColor: borderColor }]} />
            <Text style={[styles.infoValueSmall, { color: PRIMARY }]}>20°C</Text>
          </View>
        </ThermostatInfoCard>
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
  infoRow: {
    flexDirection: 'row',
    gap: 12,
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
  infoDivider: {
    alignSelf: 'stretch',
    height: 1,
    opacity: 0.6,
    marginVertical: 4,
  },
  infoDividerVertical: {
    width: 1,
    height: 20,
    opacity: 0.6,
  },
  scheduleValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scheduleTypeLabel: {
    fontSize: 11,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scheduleRow: {
    flexDirection: 'row',
  },
});
