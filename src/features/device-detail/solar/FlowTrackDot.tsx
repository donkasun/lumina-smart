import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  DOT_SIZE,
  GLOW_SIZE,
  GRID_GREEN,
  PAUSE_AT_CENTER_MS,
  POSITIONER_SIZE,
  PULSE_DURATION,
  SOLAR_ORANGE,
  TRAVEL_DURATION,
} from './solarConstants';

const styles = StyleSheet.create({
  flowDotPositioner: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -POSITIONER_SIZE / 2,
    width: POSITIONER_SIZE,
    height: POSITIONER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  flowDot: {
    borderRadius: DOT_SIZE / 2,
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  flowDotGlow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  flowDotPulse: {
    shadowColor: SOLAR_ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
});

interface FlowTrackDotProps {
  trackWidth: number;
  progressRef: SharedValue<number>;
}

/** Single pulse dot with outer glow; travels along the full track from left to right. */
export function FlowTrackDot({ trackWidth, progressRef }: FlowTrackDotProps) {
  const progress = progressRef;
  const trackWidthSV = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    trackWidthSV.value = trackWidth;
    if (trackWidth > POSITIONER_SIZE) {
      const halfTravel = TRAVEL_DURATION / 2;
      progress.value = 0;
      progress.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: halfTravel, easing: Easing.inOut(Easing.ease) }),
          withDelay(PAUSE_AT_CENTER_MS, withTiming(0.5, { duration: 0 })),
          withTiming(1, { duration: halfTravel, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      );
    }
  }, [trackWidth, trackWidthSV, progress]);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: PULSE_DURATION / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const w = trackWidthSV.value;
    // Align thumb center with line start (0) and end (w): offset by half thumb width
    const halfThumb = POSITIONER_SIZE / 2;
    const translateX = -halfThumb + progress.value * w;
    return { transform: [{ translateX }] };
  });

  const glowStyle = useAnimatedStyle(() => {
    'worklet';
    const scale = 1 + 0.3 * pulse.value;
    const opacity = 0.35 * (1 - 0.6 * pulse.value);
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 0.5, 1],
      [SOLAR_ORANGE, SOLAR_ORANGE, GRID_GREEN, GRID_GREEN]
    );
    return {
      transform: [{ scale }],
      opacity,
      backgroundColor,
    };
  });

  const dotColorStyle = useAnimatedStyle(() => {
    'worklet';
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 0.5, 1],
      [SOLAR_ORANGE, SOLAR_ORANGE, GRID_GREEN, GRID_GREEN]
    );
    return {
      backgroundColor,
      shadowColor: backgroundColor,
    };
  });

  if (trackWidth <= 0) return null;

  return (
    <Animated.View style={[styles.flowDotPositioner, animatedStyle]}>
      <Animated.View
        style={[
          styles.flowDotGlow,
          {
            width: GLOW_SIZE,
            height: GLOW_SIZE,
            borderRadius: GLOW_SIZE / 2,
            marginLeft: -GLOW_SIZE / 2,
            marginTop: -GLOW_SIZE / 2,
          },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.flowDot,
          styles.flowDotPulse,
          {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            marginLeft: -DOT_SIZE / 2,
            marginTop: -DOT_SIZE / 2,
          },
          dotColorStyle,
        ]}
      />
    </Animated.View>
  );
}
