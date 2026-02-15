import { GlassView } from '@/src/components/ui/GlassView';
import React, { useCallback } from 'react';
import { Platform, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (onPress) scale.value = withTiming(0.98, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const content = (
    <Animated.View style={[
      animatedStyle,
      { flex: 1, borderRadius: 20 },
      Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
        android: { elevation: 5 },
      }),
    ]}>
      <GlassView style={[{ padding: 16, borderRadius: 20 }, style]}>
        {children}
      </GlassView>
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      {content}
    </Pressable>
  );
};
