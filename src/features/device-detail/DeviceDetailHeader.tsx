import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SharedDeviceIcon } from '@/src/components/ui/SharedDeviceIcon';
import { Device } from '@/src/store/useDeviceStore';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DeviceDetailHeaderProps {
  device: Device;
}

export const DeviceDetailHeader: React.FC<DeviceDetailHeaderProps> = ({ device }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const getStatusText = () => {
    if (device.type === 'camera') return 'LIVE FEED';
    if (device.type === 'lock') return device.isOn ? 'LOCKED' : 'UNLOCKED';
    if (device.type === 'tv' || device.type === 'speaker') return device.isOn ? 'ACTIVE' : 'STANDBY';
    return device.isOn ? 'ON' : 'OFF';
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          { backgroundColor: surfaceColor },
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: { elevation: 4 },
          }),
        ]}
      >
        <SharedDeviceIcon
          deviceId={device.id}
          deviceType={device.type}
          isOn={device.isOn}
          size={120}
          accentColor={accentColor}
          surfaceColor={surfaceColor}
          iconColor="white"
          customColor={device.color}
        />

        <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.textContainer}>
          <Text style={[styles.deviceName, { color: textColor }]}>{device.name}</Text>
          <Text style={[styles.deviceStatus, { color: device.isOn ? accentColor : subtextColor }]}>
            {getStatusText()}
            {device.isOn && device.value !== undefined && device.unit && ` • ${device.value}${device.unit}`}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  card: {
    width: '100%',
    height: 240,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  textContainer: {
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  deviceStatus: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
