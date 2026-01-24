import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  withDelay,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface AuroraBackgroundProps {
  children?: React.ReactNode;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children }) => {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const rotation3 = useSharedValue(0);

  useEffect(() => {
    rotation1.value = withRepeat(withTiming(360, { duration: 20000 }), -1, false);
    rotation2.value = withRepeat(withDelay(1000, withTiming(360, { duration: 25000 })), -1, false);
    rotation3.value = withRepeat(withDelay(2000, withTiming(360, { duration: 30000 })), -1, false);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.sin((rotation1.value * Math.PI) / 180),
      [-1, 1],
      [1, 1.2]
    );
    return {
      transform: [
        { rotate: `${rotation1.value}deg` },
        { scale },
        { translateX: width * 0.1 },
      ],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.cos((rotation2.value * Math.PI) / 180),
      [-1, 1],
      [1.1, 1.3]
    );
    return {
      transform: [
        { rotate: `${-rotation2.value}deg` },
        { scale },
        { translateY: -height * 0.05 },
      ],
    };
  });

  const animatedStyle3 = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.sin((rotation3.value * Math.PI) / 180),
      [-1, 1],
      [1.2, 0.9]
    );
    return {
      transform: [
        { rotate: `${rotation3.value * 0.5}deg` },
        { scale },
        { translateX: -width * 0.15 },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {/* Deep background color */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050505' }]} />

        <AnimatedGradient
          colors={['rgba(76, 102, 255, 0.3)', 'transparent']}
          style={[styles.gradient, styles.gradient1, animatedStyle1]}
        />
        <AnimatedGradient
          colors={['rgba(184, 76, 255, 0.25)', 'transparent']}
          style={[styles.gradient, styles.gradient2, animatedStyle2]}
        />
        <AnimatedGradient
          colors={['rgba(76, 212, 255, 0.2)', 'transparent']}
          style={[styles.gradient, styles.gradient3, animatedStyle3]}
        />
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    opacity: Platform.OS === 'android' ? 0.6 : 0.8,
  },
  gradient1: {
    top: -width * 0.5,
    left: -width * 0.2,
  },
  gradient2: {
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  gradient3: {
    top: height * 0.2,
    left: -width * 0.5,
  },
});
