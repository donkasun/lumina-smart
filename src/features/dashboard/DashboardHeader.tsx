import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PillLayout, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Shadows } from '@/constants/shadows';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { getTimeBasedGreeting } from '../../utils/date';
import { WeatherPill } from './WeatherPill';

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = memo(({ children }) => {
  const isDark = useColorScheme() === 'dark';
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const energyBg = useThemeColor({}, 'energyPillBg');
  const liveBg = useThemeColor({}, 'livePillBg');
  const energyTextColor = useThemeColor({}, 'energyPillText');
  const energyIconBase = useThemeColor({}, 'energyPillIcon');
  const energyIconAccent = useThemeColor({}, 'energyPillIconAccent');
  const liveTextColor = useThemeColor({}, 'livePillText');
  const liveDotColor = useThemeColor({}, 'livePillDot');

  const greeting = useMemo(() => getTimeBasedGreeting('Kasun'), []);

  const dotOpacity = useSharedValue(1);
  useEffect(() => {
    dotOpacity.value = withRepeat(withTiming(0.2, { duration: 800 }), -1, true);
  }, [dotOpacity]);
  const pulseDot = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  const boltProgress = useSharedValue(0);
  useEffect(() => {
    boltProgress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [boltProgress]);
  const pulseBolt = useAnimatedStyle(() => ({ opacity: boltProgress.value }));

  // Always 1px border so layout doesn't shift; visible border in dark, matches bg in light.
  const energyBorder = { borderWidth: 1, borderColor: isDark ? borderColor : energyBg };
  const liveBorder = { borderWidth: 1, borderColor: isDark ? borderColor : liveBg };

  // Split greeting into prefix and name
  const parts = greeting.split(', ');
  const prefix = parts[0] + ', ';
  const name = parts[1] ?? '';

  return (
    <View style={styles.container}>
      <View style={styles.upperRow}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.date}>Lumina Smart</ThemedText>
          <View style={[styles.badgePill, { backgroundColor: energyBg }, energyBorder, Shadows.pill]}>
            <View style={styles.boltWrapper}>
              <IconSymbol name="bolt.fill" size={14} color={energyIconBase} />
              <Animated.View style={[StyleSheet.absoluteFill, styles.boltOverlay, pulseBolt]} pointerEvents="none">
                <IconSymbol name="bolt.fill" size={14} color={energyIconAccent} />
              </Animated.View>
            </View>
            <Text style={[styles.badgeText, { color: energyTextColor }]}>1452W</Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: liveBg }, liveBorder, Shadows.pill]}>
            <Animated.View style={[styles.liveDot, { backgroundColor: liveDotColor }, pulseDot]} />
            <Text style={[styles.badgeText, { color: liveTextColor }]}>Live</Text>
          </View>
        </View>
        <WeatherPill />
      </View>
      <ThemedText type="title" style={[styles.greeting, { color: textColor }]}>
        {prefix}
        <ThemedText type="title" style={[styles.greeting, { color: accentColor }]}>{name}</ThemedText>
      </ThemedText>

      {children && (
        <View style={styles.extraContent}>
          {children}
        </View>
      )}
    </View>
  );
});
DashboardHeader.displayName = 'DashboardHeader';

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  upperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 12,
    lineHeight: 12,
    opacity: 0.6,
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 20,
    lineHeight: 24,
    marginTop: 8,
    fontWeight: '700',
  },
  extraContent: {
    marginTop: 20,
  },
  badgePill: {
    height: PillLayout.height,
    borderRadius: PillLayout.borderRadius,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  boltWrapper: {
    width: 14,
    height: 14,
    position: 'relative',
  },
  boltOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: PillLayout.fontSize,
    lineHeight: 14,
    fontFamily: Typography.bold,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});