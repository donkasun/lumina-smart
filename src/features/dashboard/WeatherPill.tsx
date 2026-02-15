import { ThemedText } from '@/components/themed-text';
import { PillLayout, Typography } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Shadows } from '@/constants/shadows';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const WeatherPill: React.FC = memo(() => {
  const [showHumidity, setShowHumidity] = useState(false);
  const rotation = useSharedValue(0);
  
  const isDark = useColorScheme() === 'dark';
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceElevated = useThemeColor({}, 'surfaceElevated');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const weatherIconSun = useThemeColor({}, 'weatherIconSun');
  const weatherIconDrop = useThemeColor({}, 'weatherIconDrop');

  const pillBg = isDark ? surfaceElevated : surfaceColor;
  const pillBorder = { borderWidth: 1, borderColor: isDark ? borderColor : pillBg };

  // Automatic periodic flip for 3 cycles (6 toggles) after a 5s delay
  useEffect(() => {
    let count = 0;
    let interval: ReturnType<typeof setInterval>;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setShowHumidity(prev => !prev);
        count++;
        if (count >= 6) {
          clearInterval(interval);
        }
      }, 3000);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    rotation.value = withTiming(showHumidity ? 180 : 0, {
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [showHumidity, rotation]);

  const frontStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotation.value, [85, 95], [1, 0]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotation.value}deg` }
      ],
      opacity,
      zIndex: rotation.value > 90 ? 0 : 1,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const opacity = interpolate(rotation.value, [85, 95], [0, 1]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotation.value - 180}deg` }
      ],
      opacity,
      zIndex: rotation.value > 90 ? 1 : 0,
    };
  });

  return (
    <Pressable 
      onPress={() => setShowHumidity(!showHumidity)}
      style={styles.weatherPillContainer}
    >
      {/* Shadow on outer wrapper so it isn't clipped by overflow: hidden */}
      <View style={[styles.pillOuter, Shadows.pill]}>
        <View style={[styles.pill, { backgroundColor: pillBg }, pillBorder]}>
          <View style={styles.contentFlipContainer}>
          {/* Front: Temperature */}
          <Animated.View style={[styles.contentFace, frontStyle]}>
            <View style={styles.pillContent}>
              <IconSymbol name="cloud.sun.fill" size={14} color={weatherIconSun} />
              <ThemedText style={[styles.weatherText, { color: textColor }]}>25°C</ThemedText>
            </View>
          </Animated.View>
          {/* Back: Humidity */}
          <Animated.View style={[styles.contentFace, backStyle]}>
            <View style={styles.pillContent}>
              <IconSymbol name="drop.fill" size={14} color={weatherIconDrop} />
              <ThemedText style={[styles.weatherText, { color: textColor }]}>65%</ThemedText>
            </View>
          </Animated.View>
        </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  weatherPillContainer: {
    width: 76,
    height: PillLayout.height,
  },
  pillOuter: {
    width: 76,
    height: PillLayout.height,
    borderRadius: PillLayout.borderRadius,
  },
  pill: {
    width: 76,
    height: PillLayout.height,
    borderRadius: PillLayout.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  contentFlipContainer: {
    width: 76,
    height: PillLayout.height,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentFace: {
    position: 'absolute',
    width: 76,
    height: PillLayout.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  weatherText: {
    fontSize: PillLayout.fontSize,
    fontFamily: Typography.bold,
  },
});

WeatherPill.displayName = 'WeatherPill';