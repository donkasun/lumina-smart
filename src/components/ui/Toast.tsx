import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { ToastMessage } from '../../store/useConnectionStore';

const ICONS: Record<ToastMessage['type'], string> = {
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
  alert: '◉',
};

const ACCENT: Record<ToastMessage['type'], string> = {
  success: '#03a376',
  info: '#4A9EFF',
  warning: '#FF9500',
  alert: '#FF3B30',
};

const AUTO_DISMISS_MS = 4000;

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  const dismiss = () => {
    opacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(-80, { duration: 250 }, (finished) => {
      if (finished) runOnJS(onDismiss)(toast.id);
    });
  };

  useEffect(() => {
    // Slide in
    translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto-dismiss
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const accent = ACCENT[toast.type];

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Pressable style={styles.inner} onPress={dismiss}>
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: accent }]} />

        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.icon, { color: accent }]}>{ICONS[toast.type]}</Text>
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
          {toast.body ? (
            <Text style={styles.body} numberOfLines={2}>{toast.body}</Text>
          ) : null}
        </View>

        {/* Dismiss X */}
        <Text style={styles.close}>✕</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  accentBar: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
    letterSpacing: 0.2,
  },
  body: {
    color: '#FFFFFF99',
    fontSize: 11,
    lineHeight: 15,
  },
  close: {
    color: '#FFFFFF55',
    fontSize: 12,
    paddingLeft: 4,
  },
});
