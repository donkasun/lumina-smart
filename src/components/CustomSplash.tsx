import { Colors, Typography } from '@/constants/theme';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, memo } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface CustomSplashProps {
  onAnimationComplete: () => void;
}

/**
 * Ultra-optimized splash screen - Native animations only
 *
 * Animation Timeline (4.0 seconds total):
 * 0.0s - 0.7s: Logo scale entry
 * 0.7s - 1.5s: Glow pulse (native shadow)
 * 1.0s - 1.5s: App name fade-in (simplified)
 * 1.3s - 1.8s: Tagline fade-in (simplified)
 * 1.5s - 2.5s: Progress bar (slows down at 85%)
 * 2.5s - 3.5s: Hold complete state (1000ms pause)
 * 3.5s - 4.0s: Smooth fade out (500ms)
 */
const CustomSplashComponent: React.FC<CustomSplashProps> = ({ onAnimationComplete }) => {
  const backgroundColor = Colors.dark.background;

  // Animation values
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.9);
  const progressWidth = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Stage 1: Logo entry (0.0s - 0.7s)
    logoOpacity.value = withTiming(1, { duration: 200 });

    logoScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, {
        damping: 18,
        stiffness: 150,
        mass: 0.6,
      })
    );

    // Stage 2: Glow pulse (0.7s - 1.5s)
    glowOpacity.value = withDelay(
      700,
      withSequence(
        withTiming(0.8, { duration: 400 }),
        withTiming(0.4, { duration: 400 })
      )
    );

    glowScale.value = withDelay(
      700,
      withSequence(
        withTiming(1.1, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      )
    );

    // Stage 3: Simplified text animations
    // App name fade-in (1.0s - 1.5s)
    textOpacity.value = withDelay(
      1000,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    // Tagline fade-in (1.3s - 1.8s)
    taglineOpacity.value = withDelay(
      1300,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    // Stage 4: Progress bar with slowdown at 85% (1.5s - 2.5s)
    // First 85% in 600ms (fast), last 15% in 400ms (slow)
    progressWidth.value = withDelay(
      1500,
      withSequence(
        // Fast to 85%
        withTiming(0.85, {
          duration: 600,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
        // Slow to 100%
        withTiming(1, {
          duration: 400,
          easing: Easing.bezier(0.6, 0.0, 1.0, 1.0), // Slower ease
        })
      )
    );

    // Final: Wait 1s after progress completes, then fade out
    // Progress completes at: 1500 + 600 + 400 = 2500ms
    // Wait 1000ms, start fade at 3500ms
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        {
          duration: 500,
          easing: Easing.bezier(0.4, 0.0, 0.6, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(onAnimationComplete)();
          }
        }
      );
    }, 3500);

    return () => clearTimeout(timer);
  }, [
    containerOpacity,
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    onAnimationComplete,
    progressWidth,
    taglineOpacity,
    textOpacity,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { backgroundColor }, containerStyle]}>
      <StatusBar style="light" />

      {/* Subtle gradient background */}
      <View style={styles.gradientBackground} />

      <View style={styles.content}>
        {/* Native glow effect using shadow */}
        <Animated.View style={[styles.glowContainer, glowStyle]}>
          <View style={[styles.glow, styles.glowShadow]} />
        </Animated.View>

        {/* Logo with animations */}
        <Animated.View style={logoAnimatedStyle}>
          <Image
            source={require('../../assets/images/splash-icon.png')}
            style={styles.logo}
            contentFit="contain"
            priority="high"
            cachePolicy="memory-disk"
          />
        </Animated.View>

        {/* Simplified text - just fade in, positioned at bottom */}
        <View style={styles.textContainer}>
          <Animated.Text style={[styles.appName, textStyle]}>
            LUMINA SMART
          </Animated.Text>
          <Animated.Text style={[styles.tagline, taglineStyle]}>
            Smart Home, Simplified
          </Animated.Text>
        </View>

        {/* Native progress bar with slowdown at 85% */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, styles.progressTrackShadow]}>
            <Animated.View style={[styles.progressFill, progressStyle, styles.progressFillGlow]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export const CustomSplash = memo(CustomSplashComponent);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    opacity: 0.98,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#4C66FF',
    opacity: 0.15,
  },
  glowShadow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#4C66FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 40,
    },
    android: {
      elevation: 0, // Blur too expensive on Android
    },
  }) as ViewStyle,
  logo: {
    width: 160,
    height: 160,
  },
  textContainer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: Typography.bold,
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.bold,
    color: '#FFFFFF',
    opacity: 0.7,
    letterSpacing: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    width: 280,
    alignItems: 'center',
  },
  progressTrack: {
    width: 280,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressTrackShadow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }) as ViewStyle,
  progressFill: {
    height: 4,
    backgroundColor: '#FF7F5C',
    borderRadius: 2,
  },
  progressFillGlow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#FF7F5C',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }) as ViewStyle,
});
