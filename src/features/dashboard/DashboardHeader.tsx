import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassView } from '@/src/components/ui/GlassView';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { getTimeBasedGreeting } from '../../utils/date';

export const DashboardHeader: React.FC = () => {
  const [showHumidity, setShowHumidity] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(showHumidity ? 180 : 0, {
      duration: 600,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [showHumidity]);

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

  const greeting = getTimeBasedGreeting('Kasun');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <View style={styles.headerLeft}>
        <ThemedText style={styles.date}>Lumina Smart</ThemedText>
        <ThemedText type="title" style={styles.greeting}>{greeting}</ThemedText>
      </View>

      <Pressable 
        onPress={() => setShowHumidity(!showHumidity)}
        style={styles.weatherPillContainer}
      >
        {/* Front Side: Temperature */}
        <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
          <GlassView 
            intensity={40} 
            style={styles.weatherPill}
            tint="dark"
          >
            <View style={styles.pillContent}>
              <IconSymbol name="cloud.sun.fill" size={16} color="#FFD54F" />
              <ThemedText style={[styles.weatherText, { color: textColor }]}>24°C</ThemedText>
            </View>
          </GlassView>
        </Animated.View>
        
        {/* Back Side: Humidity */}
        <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
          <GlassView 
            intensity={40} 
            style={styles.weatherPill}
            tint="light"
          >
            <View style={styles.pillContent}>
              <IconSymbol name="drop.fill" size={16} color="#7CCFFF" />
              <ThemedText style={[styles.weatherText, { color: textColor }]}>65%</ThemedText>
            </View>
          </GlassView>
        </Animated.View>
      </Pressable>
    </View>
  );
};

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
  date: {
    fontSize: 12,
    lineHeight: 12,
    opacity: 0.6,
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 20,
    lineHeight: 20,
    marginTop: 4,
  },
  weatherPillContainer: {
    width: 84,
    height: 32,
  },
  weatherPill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
