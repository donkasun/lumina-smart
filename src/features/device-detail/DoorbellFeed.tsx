import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '@/constants/theme';

let feedImageSource: number | undefined;
try {
  feedImageSource = require('../../../assets/images/doorbell.gif');
} catch {
  feedImageSource = undefined;
}

/**
 * DoorbellFeed
 *
 * Shows a 16:9 hero panel with:
 * - A shimmer skeleton while "loading" (first 1500ms)
 * - After load: expo-image crossfade to doorbell.gif (or placeholder if missing),
 *   LIVE badge with pulsing dot, camera name overlay, and a 3-stop gradient overlay.
 */
export const DoorbellFeed: React.FC = () => {
  const { width: frameWidth } = useWindowDimensions();
  const [loaded, setLoaded] = useState(false);

  // --- Shimmer animation ---
  const shimmerX = useSharedValue(-frameWidth);

  useEffect(() => {
    // Start shimmer immediately
    shimmerX.value = withRepeat(
      withTiming(frameWidth + 200, { duration: 1200 }),
      -1,
      false
    );

    // Flip to loaded after 1500ms
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, [frameWidth, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  // --- LIVE dot pulse animation (only active after load) ---
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    if (!loaded) return;
    dotOpacity.value = withRepeat(
      withTiming(0.2, { duration: 800 }),
      -1,
      true
    );
  }, [loaded, dotOpacity]);

  const liveDotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  return (
    <View style={styles.heroWrapper}>
      {!loaded ? (
        /* ---- Shimmer skeleton ---- */
        <View style={styles.skeleton}>
          <Animated.View style={[styles.shimmerGradientWrapper, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.08)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      ) : (
        /* ---- Loaded state ---- */
        <View style={styles.feedContainer}>
          {feedImageSource != null ? (
            <Image
              source={feedImageSource}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={{ duration: 300 }}
            />
          ) : (
            <View style={styles.placeholder} />
          )}

          {/* Gradient overlay: dark top, transparent mid, dark bottom */}
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.3)']}
            style={StyleSheet.absoluteFill}
          />

          {/* LIVE badge — top left */}
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, liveDotStyle]} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>

          {/* Camera name — bottom left */}
          <View style={styles.cameraNameWrapper}>
            <Text style={styles.cameraNameText}>FRONT DOOR · HD</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: 'hidden',
  },

  // Shimmer
  skeleton: {
    flex: 1,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  shimmerGradientWrapper: {
    position: 'absolute',
    height: '100%',
    width: '60%',
  },

  // Loaded
  feedContainer: {
    flex: 1,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1E293B',
  },

  // LIVE badge
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#34D399',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 0.5,
  },

  // Camera name
  cameraNameWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  cameraNameText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
  },
});
