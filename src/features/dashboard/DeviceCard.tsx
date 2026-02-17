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
    case 'sprinkler': return 'drop.fill';
    default: return 'square.grid.2x2.fill';
  }
}

function getDeviceIconStyle(type: string, status: string): { iconColor: string; bg: string } {
  const isOn = status === 'on' || status === 'locked' || status === 'armed';

  const map: Record<string, { iconColor: string; bg: string }> = {
    light:      { iconColor: isOn ? '#FFFFFF' : '#FF7D54', bg: isOn ? '#FF7D54' : '#F3F4F6' },
    thermostat: { iconColor: '#EA580C', bg: '#FFEDD5' },
    ac:         { iconColor: '#6B7280', bg: '#F3F4F6' },
    lock:       { iconColor: status === 'locked' ? '#0D9488' : '#6B7280', bg: status === 'locked' ? '#CCFBF1' : '#F3F4F6' },
    garage:     { iconColor: '#6B7280', bg: '#F3F4F6' },
    alarm:      { iconColor: status === 'armed' ? '#DC2626' : '#6B7280', bg: status === 'armed' ? '#FEE2E2' : '#F3F4F6' },
    speaker:    { iconColor: '#9333EA', bg: '#F3E8FF' },
    tv:         { iconColor: '#6B7280', bg: '#F3F4F6' },
    solar:      { iconColor: '#FF7D54', bg: '#FFEDD5' },
    camera:     { iconColor: '#FF7D54', bg: '#FF7D54' },
    vacuum:     { iconColor: isOn ? '#34D399' : '#6B7280', bg: isOn ? '#D1FAE5' : '#F3F4F6' },
    doorbell:   { iconColor: '#FF7D54', bg: '#FFEDD5' },
    purifier:   { iconColor: '#3B82F6', bg: '#DBEAFE' },
    sprinkler:  { iconColor: isOn ? '#3B82F6' : '#6B7280', bg: isOn ? '#DBEAFE' : '#F3F4F6' },
  };
  return map[type] ?? { iconColor: '#6B7280', bg: '#F3F4F6' };
}

function getStatusColor(type: string, status: string, accent: string, iconColor: string): string {
  if (status === 'on')     return accent;
  if (status === 'locked') return '#0D9488';
  if (status === 'armed')  return '#DC2626';
  return iconColor;
}

function getStatusLabel(device: Device): string {
  if (device.type === 'camera')    return 'LIVE FEED';
  if (device.type === 'lock')     return device.isOn ? 'LOCKED' : 'UNLOCKED';
  if (device.type === 'vacuum')    return device.isOn ? 'CLEANING' : 'DOCKED';
  if (device.type === 'doorbell')  return device.isOn ? 'LIVE' : 'OFF';
  if (device.type === 'purifier')  return device.isOn ? `AQI ${device.value}` : 'OFF';
  if (device.type === 'sprinkler') return device.isOn ? 'WATERING' : 'IDLE';
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
    (a as any).category === (b as any).category
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

  const status = device.isOn ? (device.type === 'lock' ? 'locked' : 'on') : 'off';
  const { iconColor: iconTint, bg: iconBg } = getDeviceIconStyle(device.type, status);
  const statusColor = getStatusColor(device.type, status, accent, iconColor);
  const statusLabel = getStatusLabel(device);
  const isCamera = device.type === 'camera';
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
              <IconSymbol
                name={getIconName(device.type, device.isOn) as any}
                size={20}
                color={isCamera ? '#FFFFFF' : iconTint}
              />
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
            <Text style={[styles.status, { color: isCamera ? 'rgba(255,255,255,0.8)' : statusColor }]}>
              {statusLabel}
            </Text>
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
  status: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
