import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface CustomSplashProps {
  onAnimationComplete: () => void;
}

export const CustomSplash: React.FC<CustomSplashProps> = ({ onAnimationComplete }) => {
  // Use the dark theme background specifically for the splash
  const backgroundColor = Colors.dark.background;
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Show splash for 2 seconds, then fade out
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor }, animatedStyle]}>
      {/* Force status bar to light (white icons) during splash */}
      <StatusBar style="light" />
      
      <View style={styles.center}>
        <Image 
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
  },
});
