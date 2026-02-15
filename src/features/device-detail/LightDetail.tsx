import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Circle, Defs, RadialGradient, Stop, Svg } from 'react-native-svg';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/src/utils/haptics';
import { BrightnessSlider } from './BrightnessSlider';
import { ColourPalette } from './ColourPalette';
import { ColourTemperatureBar } from './ColourTemperatureBar';
import { PRIMARY } from './constants';
import { ScheduleList } from './ScheduleList';

const GLOW_SIZE = 140;
const BULB_ICON_SIZE = 80;
const GLOW_OFF_COLOR = '#E2E8F0';

function isLightColor(hex: string): boolean {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return false;
  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.7;
}

export const LightDetail: React.FC<{ device: Device }> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);
  const updateDeviceValue = useDeviceStore((s) => s.updateDeviceValue);
  const updateDeviceColor = useDeviceStore((s) => s.updateDeviceColor);

  const glowOpacity = useSharedValue(0.15);
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [glowOpacity]);

  const glowBaseAlpha = useSharedValue(0.2);
  React.useEffect(() => {
    if (device.isOn) {
      glowBaseAlpha.value = 0.3 + (device.value / 100) * 0.45;
    } else {
      glowBaseAlpha.value = 0.6;
    }
  }, [device.isOn, device.color, device.value]);

  const glowContainerStyle = useAnimatedStyle(() => ({
    opacity: glowBaseAlpha.value * glowOpacity.value,
  }));

  const handlePowerPress = useCallback(() => {
    haptics.tap();
    toggleDevice(device.id);
  }, [device.id, toggleDevice]);

  const handleBrightnessChange = useCallback(
    (v: number) => updateDeviceValue(device.id, v),
    [device.id, updateDeviceValue]
  );

  const handleColorChange = useCallback(
    (color: string) => updateDeviceColor(device.id, color),
    [device.id, updateDeviceColor]
  );

  const glowColor = device.isOn ? (device.color ?? PRIMARY) : GLOW_OFF_COLOR;
  const powerButtonBg = device.isOn ? (device.color ?? PRIMARY) : '#E2E8F0';
  const powerIconColor = device.isOn
    ? isLightColor(device.color ?? PRIMARY)
      ? '#000000'
      : '#FFFFFF'
    : '#94A3B8';

  return (
    <View style={styles.section}>
      <View style={styles.heroZone}>
        <View style={styles.heroControlsRow}>
          <View style={styles.bulbGlowWrapper}>
            <Animated.View style={[styles.glowBlobSvg, glowContainerStyle]}>
              <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
                <Defs>
                  <RadialGradient id="bulbGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <Stop offset="0" stopColor={glowColor} stopOpacity={1} />
                    <Stop offset="1" stopColor={glowColor} stopOpacity={0.6} />
                  </RadialGradient>
                </Defs>
                <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#bulbGlow)" />
              </Svg>
            </Animated.View>
            <View style={styles.bulbIconWrapper}>
              <IconSymbol
                name="lightbulb.fill"
                size={BULB_ICON_SIZE}
                color={device.isOn ? (device.color ?? PRIMARY) : '#CBD5E1'}
              />
            </View>
          </View>
          <View style={styles.powerControlGroup}>
            <Pressable onPress={handlePowerPress}>
              <View style={[styles.powerButton, { backgroundColor: powerButtonBg }]}>
                <Ionicons name="power" size={24} color={powerIconColor} />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
      <BrightnessSlider value={device.value} onChange={handleBrightnessChange} />
      <ColourTemperatureBar />
      <ColourPalette selectedColor={device.color} onColorChange={handleColorChange} />
      <ScheduleList />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  heroZone: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  heroControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulbGlowWrapper: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlobSvg: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    left: 0,
    top: 0,
  },
  bulbIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerControlGroup: {
    position: 'absolute',
    left: GLOW_SIZE / 2 + 40,
  },
  powerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
