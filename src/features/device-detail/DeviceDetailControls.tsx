import { Typography } from '@/constants/theme';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraDetail } from './CameraDetail';
import { DoorbellDetail } from './DoorbellDetail';
import { LightDetail } from './LightDetail';
import { LockDetail } from './LockDetail';
import { PurifierDetail } from './purifier';
import { SolarDetail } from './SolarDetail';
import { SprinklerDetail } from './SprinklerDetail';
import { ThermostatDetail } from './ThermostatDetail';
import { VacuumDetail } from './VacuumDetail';

export interface DeviceDetailControlsProps {
  device: Device;
}

export const DeviceDetailControls: React.FC<DeviceDetailControlsProps> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);

  switch (device.type) {
    case 'light':
      return <LightDetail device={device} />;

    case 'thermostat':
      return <ThermostatDetail device={device} />;

    case 'camera':
      return <CameraDetail device={device} />;

    case 'lock':
      return <LockDetail device={device} />;

    case 'ac':
      return (
        <View style={styles.section}>
          <GlassCard style={styles.acCard}>
            <Text style={styles.acLabel}>Air Conditioning</Text>
            <AnimatedToggle
              value={device.isOn}
              onChange={(_v) => toggleDevice(device.id)}
              label="Power"
            />
          </GlassCard>
        </View>
      );

    case 'solar':
      return <SolarDetail device={device} />;

    case 'sprinkler':
      return <SprinklerDetail device={device} />;

    case 'vacuum':
      return <VacuumDetail device={device} />;

    case 'doorbell':
      return <DoorbellDetail device={device} floatingBottomBar />;

    case 'purifier':
      return <PurifierDetail device={device} />;

    case 'tv':
      return (
        <View style={styles.section}>
          <GlassCard style={styles.acCard}>
            <Text style={styles.acLabel}>Smart TV</Text>
            <AnimatedToggle
              value={device.isOn}
              onChange={(_v) => toggleDevice(device.id)}
              label="Power"
            />
          </GlassCard>
        </View>
      );

    case 'speaker':
      return (
        <View style={styles.section}>
          <GlassCard style={styles.acCard}>
            <Text style={styles.acLabel}>Speakers</Text>
            <AnimatedToggle
              value={device.isOn}
              onChange={(_v) => toggleDevice(device.id)}
              label="Power"
            />
          </GlassCard>
        </View>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  acCard: {
    gap: 16,
  },
  acLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: '#64748B',
  },
});
