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

export const WeatherPill: React.FC = () => {
  const [showHumidity, setShowHumidity] = useState(false);
  const rotation = useSharedValue(0);
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

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

  return (
    <Pressable 
      onPress={() => setShowHumidity(!showHumidity)}
      style={styles.weatherPillContainer}
    >
      {/* Front Side: Temperature */}
      <Animated.View style={[StyleSheet.absoluteFill, frontStyle]}>
        <GlassView 
          intensity={40} 
          style={[styles.weatherPill, { backgroundColor: '#FFD54F1A', borderColor: '#FFD54F' }]}
          tint="dark"
        >
          <View style={styles.pillContent}>
            <IconSymbol name="cloud.sun.fill" size={14} color='#ffce30' />
            <ThemedText style={[styles.weatherText, { color: textColor }]}>72°F</ThemedText>
          </View>
        </GlassView>
      </Animated.View>
      
      {/* Back Side: Humidity */}
      <Animated.View style={[StyleSheet.absoluteFill, backStyle]}>
        <GlassView 
          intensity={40} 
          style={[styles.weatherPill, { backgroundColor: '#7CCFFF1A', borderColor: '#7CCFFF' }]}
          tint="light"
        >
          <View style={styles.pillContent}>
            <IconSymbol name="drop.fill" size={14} color='#7CCFFF' />
            <ThemedText style={[styles.weatherText, { color: textColor }]}>65%</ThemedText>
          </View>
        </GlassView>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  weatherPillContainer: {
    width: 72,
    height: 28,
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
    fontSize: 10,
    fontWeight: '600',
  },
});
