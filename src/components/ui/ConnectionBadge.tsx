import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useConnectionStore } from '../../store/useConnectionStore';

const DOT_COLOR: Record<string, string> = {
  connected: '#03a376',
  reconnecting: '#FF9500',
  disconnected: '#FF3B30',
};

const LABEL: Record<string, string> = {
  connected: 'Live',
  reconnecting: 'Reconnecting',
  disconnected: 'Offline',
};

export const ConnectionBadge: React.FC = () => {
  const status = useConnectionStore((s) => s.status);
  const energyUsage = useConnectionStore((s) => s.energyUsage);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'reconnecting') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1, { duration: 300 });
    }
  }, [status, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const color = DOT_COLOR[status];

  return (
    <View style={styles.row}>
      {/* Energy pill (only when connected) */}
      {status === 'connected' && energyUsage > 0 && (
        <View style={styles.energyPill}>
          <Text style={styles.energyText}>⚡ {energyUsage}W</Text>
        </View>
      )}

      {/* Status badge */}
      <View style={[styles.badge, { borderColor: color + '44' }]}>
        <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]} />
        <Text style={[styles.label, { color }]}>{LABEL[status]}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#00000015',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
    letterSpacing: 0.3,
  },
  energyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FF9500' + '20',
    borderWidth: 1,
    borderColor: '#FF950044',
  },
  energyText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
    color: '#FF9500',
    letterSpacing: 0.2,
  },
});
