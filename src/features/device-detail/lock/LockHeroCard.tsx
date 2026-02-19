import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device } from '@/src/store/useDeviceStore';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  RIPPLE_COUNT,
  RIPPLE_LOOP_DURATION_MS,
  RIPPLE_OPACITY_START,
  RIPPLE_SCALE_END,
  RIPPLE_SCALE_START,
  RIPPLE_SIZE,
  DASHED_RING_SPIN_DURATION_MS,
} from './lockConstants';

const LockIconSvg =
  require('../../../../assets/icons/door-lock.svg')?.default ?? require('../../../../assets/icons/door-lock.svg');

interface LockHeroCardProps {
  device: Device;
  locked: boolean;
  powerOn: boolean;
  onLockToggle: () => void;
  lockAccent: string;
  isExternal: boolean;
  title: string;
  subtitle: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
}

export function LockHeroCard({
  device,
  locked,
  powerOn,
  onLockToggle,
  lockAccent,
  isExternal,
  title,
  subtitle,
  cardBg,
  borderColor,
  textColor,
  subtextColor,
}: LockHeroCardProps) {
  const LockIcon = device.image ?? LockIconSvg;
  const LockIconComponent = LockIcon?.default ?? LockIcon;
  const centerIconName = isExternal ? 'shield.fill' : 'lock.fill';
  const heroIconColor = locked ? lockAccent : subtextColor;
  const rippleFill = locked ? `${lockAccent}50` : `${subtextColor}30`;

  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, { duration: DASHED_RING_SPIN_DURATION_MS, easing: Easing.linear }),
      -1
    );
  }, [spin]);
  const dashedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const pulseProgress = useSharedValue(0);
  const pulseActive = useSharedValue(0);
  const pulseRunning = locked && powerOn;
  useEffect(() => {
    if (pulseRunning) {
      pulseActive.value = 1;
      pulseProgress.value = 0;
      pulseProgress.value = withRepeat(
        withTiming(1, { duration: RIPPLE_LOOP_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseActive.value = 0;
      cancelAnimation(pulseProgress);
      pulseProgress.value = 0;
    }
  }, [pulseRunning, pulseProgress, pulseActive]);

  const useRippleCircleStyle = (segmentIndex: number) =>
    useAnimatedStyle(() => {
      'worklet';
      if (pulseActive.value < 0.5) {
        return { transform: [{ scale: RIPPLE_SCALE_START }], opacity: 0 };
      }
      const progress = pulseProgress.value;
      const segmentStart = segmentIndex / RIPPLE_COUNT;
      const age = (progress - segmentStart + 1) % 1;
      const eased = 1 - (1 - age) * (1 - age);
      const scale = RIPPLE_SCALE_START + (RIPPLE_SCALE_END - RIPPLE_SCALE_START) * eased;
      const opacity = age <= 1 ? RIPPLE_OPACITY_START * (1 - age) : 0;
      return { transform: [{ scale }], opacity };
    });

  const ripple0 = useRippleCircleStyle(0);
  const ripple1 = useRippleCircleStyle(1);
  const ripple2 = useRippleCircleStyle(2);
  const ripple3 = useRippleCircleStyle(3);

  return (
    <GlassCard style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.dashedRing, { borderColor }, dashedRingStyle]} />
        <View style={[styles.heroIconWrap, { width: RIPPLE_SIZE, height: RIPPLE_SIZE }]}>
          <Animated.View style={[styles.rippleCircle, { backgroundColor: rippleFill }, ripple0]} />
          <Animated.View style={[styles.rippleCircle, { backgroundColor: rippleFill }, ripple1]} />
          <Animated.View style={[styles.rippleCircle, { backgroundColor: rippleFill }, ripple2]} />
          <Animated.View style={[styles.rippleCircle, { backgroundColor: rippleFill }, ripple3]} />
          <View style={styles.heroIconCenter}>
            {typeof LockIconComponent === 'function' ? (
              <LockIconComponent width={64} height={64} color={heroIconColor} />
            ) : (
              <IconSymbol name={centerIconName} size={64} color={heroIconColor} />
            )}
          </View>
        </View>
      </View>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>
      <View style={[styles.lockRow, !powerOn && styles.lockRowDisabled]} pointerEvents={powerOn ? 'auto' : 'none'}>
        <Text style={[styles.lockLabel, { color: subtextColor }]}>{locked ? 'Locked' : 'Unlocked'}</Text>
        <AnimatedToggle
          value={locked}
          onChange={onLockToggle}
          activeColor={lockAccent}
          onLabel="Yes"
          offLabel="Now"
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 8,
  },
  ringWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dashedRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  heroIconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroIconCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontFamily: Typography.bold,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.medium,
    marginBottom: 20,
    textAlign: 'center',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lockRowDisabled: {
    opacity: 0.5,
  },
  lockLabel: {
    fontSize: 14,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
});
