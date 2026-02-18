import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PARTICLE_X = [30, 65, 95, 120, 145, 170, 195, 220, 245, 260];
const COLORS = [
  'rgba(255,125,84,0.35)',
  'rgba(255,125,84,0.28)',
  'rgba(255,125,84,0.22)',
];
const TY_START = 60;
const TY_END = -20;
const DURATION = 2400;

function ParticleDot({ x, color, delay }: { x: number; color: string; delay: number }) {
  const ty = useSharedValue(TY_START);
  const op = useSharedValue(0);

  useEffect(() => {
    ty.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(TY_END, { duration: DURATION, easing: Easing.out(Easing.quad) }),
          withTiming(TY_START, { duration: 0 })
        ),
        -1
      )
    );
    op.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: DURATION * 0.4, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: DURATION * 0.6, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 0 })
        ),
        -1
      )
    );
  }, [delay, op, ty]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View
      style={[styles.dot, { left: x, backgroundColor: color }, animStyle]}
    />
  );
}

export const ParticleField: React.FC = () => (
  <View style={styles.container} pointerEvents="none">
    {PARTICLE_X.map((x, i) => (
      <ParticleDot key={i} x={x} color={COLORS[i % COLORS.length]} delay={i * 200} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 6,
    borderRadius: 4,
  },
});
