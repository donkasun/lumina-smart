import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassView } from '@/src/components/ui/GlassView';
import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { formatHeaderDate, getTimeBasedGreeting } from '../../utils/date';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    gap: 2,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9BA1A6',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  weatherPill: {
    width: 90,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  weatherText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export const DashboardHeader: React.FC = () => {
  const [showHumidity, setShowHumidity] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(showHumidity ? 180 : 0, {
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [showHumidity]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotation.value}deg` }
    ],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotation.value - 180}deg` }
    ],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  }));

  const greeting = getTimeBasedGreeting('Alex');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <View style={styles.headerLeft}>
        <ThemedText style={styles.brand}>Aether Home</ThemedText>
        <ThemedText style={[styles.greeting, { color: textColor }]}>{greeting}</ThemedText>
      </View>

      <Pressable onPress={() => setShowHumidity(!showHumidity)}>
        <GlassView 
          intensity={60} 
          style={styles.weatherPill}
          tint={showHumidity ? 'light' : 'dark'}
        >
          <Animated.View style={[styles.pillContent, frontStyle]}>
            <IconSymbol name="cloud.sun.fill" size={20} color="#007AFF" />
            <ThemedText style={[styles.weatherText, { color: textColor }]}>72°F</ThemedText>
          </Animated.View>
          
          <Animated.View style={[styles.pillContent, backStyle]}>
            <IconSymbol name="drop.fill" size={20} color="#007AFF" />
            <ThemedText style={[styles.weatherText, { color: textColor }]}>65%</ThemedText>
          </Animated.View>
        </GlassView>
      </Pressable>
    </View>
  );
};
