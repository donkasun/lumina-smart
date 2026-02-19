import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  EXTERNAL_LOCK_GREEN,
  INTERNAL_LOCK_ORANGE,
  isExternalDoor,
} from '../device-detail/lock';
import { Device } from '../../store/useDeviceStore';

const { width: windowWidth } = Dimensions.get('window');
// 16pt × 2 page padding, 12pt × 2 gaps between 3 columns
const CARD_WIDTH = (windowWidth - 32 - 24) / 3;
const MIN_HEIGHT = CARD_WIDTH * 1;

function getIconName(type: string, isOn: boolean): string {
  switch (type) {
    case 'light': return 'lightbulb.fill';
    case 'thermostat': return 'thermometer.medium';
    case 'lock': return isOn ? 'lock.fill' : 'lock.open.fill';
    case 'camera': return 'video.fill';
    case 'ac':       return 'wind';
    case 'vacuum':   return isOn ? 'house.fill' : 'house';
    case 'doorbell': return 'bell.fill';
    case 'purifier': return 'wind';
    case 'solar': return 'sun.max.fill';
    case 'sprinkler': return 'spigot.fill';
    case 'tv': return 'tv.fill';
    case 'speaker': return 'hifispeaker.fill';
    default: return 'square.grid.2x2.fill';
  }
}

function getDeviceIconStyle(type: string, status: string, device?: Device): { iconColor: string; bg: string } {
  const isOn = status === 'on' || status === 'locked' || status === 'armed';
  const isMainDoor = type === 'lock' && device && isExternalDoor(device.name);
  const lockLocked = type === 'lock' && status === 'locked';
  const lockIconColor = lockLocked ? (isMainDoor ? EXTERNAL_LOCK_GREEN : INTERNAL_LOCK_ORANGE) : '#6B7280';
  const lockBg = lockLocked ? (isMainDoor ? '#D1FAE5' : '#FFEDD5') : '#F3F4F6';

  const map: Record<string, { iconColor: string; bg: string }> = {
    light:      { iconColor: isOn ? '#FFFFFF' : '#6B7280', bg: isOn ? '#FF7D54' : '#F3F4F6' },
    thermostat: { iconColor: '#EA580C', bg: '#FFEDD5' },
    ac:         { iconColor: '#6B7280', bg: '#F3F4F6' },
    lock:       { iconColor: lockIconColor, bg: lockBg },
    garage:     { iconColor: '#6B7280', bg: '#F3F4F6' },
    alarm:      { iconColor: status === 'armed' ? '#DC2626' : '#6B7280', bg: status === 'armed' ? '#FEE2E2' : '#F3F4F6' },
    speaker:    { iconColor: isOn ? '#9333EA' : '#6B7280', bg: isOn ? '#F3E8FF' : '#F3F4F6' },
    tv:         { iconColor: isOn ? '#3B82F6' : '#6B7280', bg: isOn ? '#BFDBFE' : '#F3F4F6' },
    solar:      { iconColor: isOn ? '#F59E0B' : '#6B7280', bg: isOn ? '#FEF3C7' : '#F3F4F6' },
    camera:     { iconColor: '#FF7D54', bg: '#FF7D54' },
    vacuum:     { iconColor: isOn ? '#34D399' : '#6B7280', bg: isOn ? '#D1FAE5' : '#F3F4F6' },
    doorbell:   { iconColor: isOn ? '#FF7D54' : '#6B7280', bg: isOn ? '#FFEDD5' : '#F3F4F6' },
    purifier:   { iconColor: isOn ? '#3B82F6' : '#6B7280', bg: isOn ? '#BFDBFE' : '#F3F4F6' },
    sprinkler:  { iconColor: isOn ? '#0D9488' : '#6B7280', bg: isOn ? '#CCFBF1' : '#F3F4F6' },
  };
  return map[type] ?? { iconColor: '#6B7280', bg: '#F3F4F6' };
}

function getStatusColor(type: string, status: string, accent: string, iconColor: string, device?: Device): string {
  if (status === 'on')     return accent;
  if (status === 'locked') return type === 'lock' && device && !isExternalDoor(device.name) ? INTERNAL_LOCK_ORANGE : EXTERNAL_LOCK_GREEN;
  if (status === 'armed')  return '#DC2626';
  return iconColor;
}

function getStatusLabel(device: Device): string {
  if (device.type === 'camera')    return 'LIVE FEED';
  if (device.type === 'lock')     return device.value === 1 ? 'LOCKED' : 'UNLOCKED';
  if (device.type === 'thermostat') {
    if (!device.isOn) return 'OFF';
    const threshold = 23;
    const mode = device.value >= threshold ? 'HEATING' : 'COOLING';
    return `${mode} ${device.value}${device.unit ?? '°C'}`;
  }
  if (device.type === 'vacuum')    return device.isOn ? 'CLEANING' : 'DOCKED';
  if (device.type === 'doorbell')  return device.isOn ? 'LIVE' : 'OFF';
  if (device.type === 'purifier')  return device.isOn ? `AQI ${device.value}` : 'OFF';
  if (device.type === 'sprinkler') return device.isOn ? 'WATERING' : 'IDLE';
  if (device.type === 'solar') return device.isOn ? 'GENERATING' : 'IDLE';
  if (device.type === 'tv' || device.type === 'speaker') return device.isOn ? 'ACTIVE' : 'STANDBY';
  return device.isOn ? 'ON' : 'OFF';
}

interface DeviceCardProps {
  device: Device;
  onPress: () => void;
}

function areEqual(prev: DeviceCardProps, next: DeviceCardProps): boolean {
  const a = prev.device;
  const b = next.device;
  return (
    a.id === b.id &&
    a.isOn === b.isOn &&
    a.value === b.value &&
    a.type === b.type &&
    a.name === b.name &&
    (a as any).category === (b as any).category &&
    (a as any).batteryLevel === (b as any).batteryLevel
  );
}

export const DeviceCard: React.FC<DeviceCardProps> = memo(({ device, onPress }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const accent = Colors[theme].accent;
  const iconColor = Colors[theme].icon;
  const textColor = Colors[theme].text;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 120, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const status = device.type === 'lock'
    ? (device.value === 1 ? 'locked' : 'unlocked')
    : (device.isOn ? 'on' : 'off');
  const { iconColor: iconTint, bg: iconBg } = getDeviceIconStyle(device.type, status, device);
  const statusColor = getStatusColor(device.type, status, accent, iconColor, device);
  const statusLabel = getStatusLabel(device);
  const isCamera = device.type === 'camera';
  const hasCustomIcon = (device.type === 'vacuum' || device.type === 'purifier' || device.type === 'doorbell' || device.type === 'sprinkler' || device.type === 'solar' || device.type === 'lock') && device.image;
  const isActiveWithUnderglow = (device.type === 'light' && device.isOn) || device.type === 'camera';

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'rgba(30,30,30,0.70)' : 'rgba(255,255,255,0.70)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.35)';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      {/* Shadow lives here — no overflow:hidden so it renders on iOS */}
      <Animated.View style={[styles.shadowLayer, animatedStyle, Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
        android: { elevation: 5 },
      })]}>
        {/* Clip layer — overflow:hidden keeps camera image inside rounded corners */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {/* Camera background */}
          {isCamera && device.image && (
            <View style={StyleSheet.absoluteFill}>
              <Image
                source={device.image}
                style={styles.cameraImage}
                resizeMode="cover"
              />
              <View style={[StyleSheet.absoluteFill, styles.cameraOverlay]} />
            </View>
          )}

          <View style={styles.inner}>
            {/* Icon container */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: iconBg },
                isActiveWithUnderglow ? Shadows.primaryUnderglow : Shadows.card,
              ]}
            >
              {hasCustomIcon && device.image ? (
                (() => {
                  const Resolved = device.image?.default ?? device.image;
                  if (typeof Resolved === 'function') {
                    const IconComponent = Resolved;
                    return (
                      <IconComponent
                        width={28}
                        height={28}
                        color={iconTint}
                      />
                    );
                  }
                  return (
                    <Image
                      source={device.image}
                      style={[styles.customIconImage, { tintColor: iconTint }]}
                      contentFit="contain"
                    />
                  );
                })()
              ) : (
                <IconSymbol
                  name={getIconName(device.type, device.type === 'lock' ? device.value === 1 : device.isOn) as any}
                  size={20}
                  color={isCamera ? '#FFFFFF' : iconTint}
                />
              )}
            </View>

            {/* Camera REC badge */}
            {isCamera && device.isOn && (
              <View style={styles.recBadge}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>REC</Text>
              </View>
            )}

            {/* Device name */}
            <Text
              style={[styles.name, { color: isCamera ? '#FFFFFF' : textColor }]}
              numberOfLines={1}
            >
              {device.name}
            </Text>

            {/* Status */}
            <View style={styles.statusRow}>
              <Text style={[styles.status, { color: isCamera ? 'rgba(255,255,255,0.8)' : statusColor }]}>
                {statusLabel}
              </Text>
              {device.type === 'purifier' && device.batteryLevel != null && device.isOn && (
                <Text style={[styles.status, styles.statusSecondary, { color: isCamera ? 'rgba(255,255,255,0.8)' : statusColor }]}>
                  {' · '}{device.batteryLevel}%
                </Text>
              )}
              {device.type === 'light' && device.isOn && (
                <>
                  <View
                    style={[
                      styles.lightColorDot,
                      { backgroundColor: device.color ?? '#FF7D54' },
                    ]}
                  />
                  <Text style={[styles.status, styles.lightBrightness, { color: isCamera ? 'rgba(255,255,255,0.8)' : statusColor }]}>
                    {device.value}{device.unit ?? '%'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}, areEqual);

DeviceCard.displayName = 'DeviceCard';

const styles = StyleSheet.create({
  pressable: {
    width: CARD_WIDTH,
    minHeight: MIN_HEIGHT,
  },
  shadowLayer: {
    width: CARD_WIDTH,
    minHeight: MIN_HEIGHT,
    borderRadius: 20,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cameraImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  cameraOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  inner: {
    flex: 1,
    minHeight: MIN_HEIGHT,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customIconImage: {
    width: 28,
    height: 28,
  },
  recBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  recDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'white',
  },
  recText: {
    color: 'white',
    fontSize: 7,
    fontWeight: '900',
    lineHeight: 10,
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  status: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statusSecondary: {
    textTransform: 'none',
  },
  lightColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  lightBrightness: {
    textTransform: 'none',
  },
});
