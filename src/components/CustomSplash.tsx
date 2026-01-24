import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Logo } from './ui/Logo';

const { width, height } = Dimensions.get('window');

interface CustomSplashProps {
  onAnimationComplete: () => void;
}

export const CustomSplash: React.FC<CustomSplashProps> = ({ onAnimationComplete }) => {
  const progress = useSharedValue(0); // 0 to 1

  useEffect(() => {
    // Start animation sequence
    progress.value = withDelay(
      500,
      withSpring(1, { damping: 15, stiffness: 90 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    // Center to top-left-ish (Header position)
    const translateY = interpolate(progress.value, [0, 1], [0, -height * 0.35]);
    const scale = interpolate(progress.value, [0, 1], [1.5, 0.6]);
    const opacity = interpolate(progress.value, [0, 0.2, 1], [0, 1, 1]);

    return {
      opacity,
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={logoStyle}>
          <Logo size={120} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
