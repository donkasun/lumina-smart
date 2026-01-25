import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';
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
  
  const surfaceColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');
  const shadowLight = useThemeColor({}, 'shadowLight');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');

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
      {/* Front Side: Temperature (Raised / Outer Shadows) */}
      <Animated.View style={[styles.pillWrapper, frontStyle]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect
            x={4}
            y={4}
            width={76}
            height={24}
            r={12}
            color={surfaceColor}
          >
            <Shadow dx={2} dy={2} blur={2} color={shadowDark} />
            <Shadow dx={-2} dy={-2} blur={2} color={shadowLight} />
          </RoundedRect>
        </Canvas>
        <View style={styles.pillContent}>
          <IconSymbol name="cloud.sun.fill" size={16} color={accentColor} />
          <ThemedText style={[styles.weatherText, { color: textColor }]}>72°F</ThemedText>
        </View>
      </Animated.View>
      
      {/* Back Side: Humidity (Pressed / Inner Shadows) */}
      <Animated.View style={[styles.pillWrapper, backStyle]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <RoundedRect
            x={4}
            y={4}
            width={76}
            height={24}
            r={12}
            color={surfaceColor}
          >
            <Shadow dx={2} dy={2} blur={2} color={shadowDark} inner />
            <Shadow dx={-2} dy={-2} blur={2} color={shadowLight} inner />
          </RoundedRect>
        </Canvas>
        <View style={styles.pillContent}>
          <IconSymbol name="drop.fill" size={16} color={accentColor} />
          <ThemedText style={[styles.weatherText, { color: textColor }]}>65%</ThemedText>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  weatherPillContainer: {
    width: 84,
    height: 32,
  },
  pillWrapper: {
    position: 'absolute',
    width: 84,
    height: 32,
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