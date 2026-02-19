import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SharedDeviceIcon } from '@/src/components/ui/SharedDeviceIcon';
import { Device } from '@/src/store/useDeviceStore';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const EXTERNAL_LOCK_GREEN = '#10B981';
const INTERNAL_LOCK_ORANGE = '#FF9500';

function isExternalDoor(name: string): boolean {
  const n = name.toLowerCase();
  return /door|front|back|main|entrance|gate|entry/.test(n);
}

interface DeviceDetailHeaderProps {
  device: Device;
}

export const DeviceDetailHeader: React.FC<DeviceDetailHeaderProps> = ({ device }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const isLockActive = device.type === 'lock' ? device.value === 1 : device.isOn;
  const lockAccent = device.type === 'lock' && device.value === 1
    ? (isExternalDoor(device.name) ? EXTERNAL_LOCK_GREEN : INTERNAL_LOCK_ORANGE)
    : undefined;
  const statusColor = lockAccent ?? (isLockActive ? accentColor : subtextColor);
  const iconCustomColor = device.type === 'lock' ? lockAccent : device.color;

  const getStatusText = () => {
    if (device.type === 'camera') return 'LIVE FEED';
    if (device.type === 'lock') return device.value === 1 ? 'LOCKED' : 'UNLOCKED';
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
          isOn={device.type === 'lock' ? device.value === 1 : device.isOn}
          size={120}
          accentColor={lockAccent ?? accentColor}
          surfaceColor={surfaceColor}
          iconColor="white"
          customColor={iconCustomColor}
          customIcon={device.image}
        />

        <Animated.View entering={FadeIn.delay(150).duration(400)} style={styles.textContainer}>
          <Text style={[styles.deviceName, { color: textColor }]}>{device.name}</Text>
          <Text style={[styles.deviceStatus, { color: statusColor }]}>
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
