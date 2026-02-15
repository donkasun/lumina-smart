import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PRIMARY } from './constants';

export interface ModeButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const ModeButton: React.FC<ModeButtonProps> = ({ icon, label, isActive, onPress }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 120 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View style={[styles.modeButtonWrapper, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.modeButton,
          isActive
            ? { backgroundColor: PRIMARY, ...(Shadows.primaryUnderglow as object) }
            : {
                backgroundColor: surfaceColor,
                borderWidth: 1,
                borderColor,
              },
        ]}
      >
        <IconSymbol
          name={icon as any}
          size={22}
          color={isActive ? '#FFFFFF' : textColor}
        />
        <Text style={[styles.modeButtonLabel, { color: isActive ? '#FFFFFF' : textColor }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modeButtonWrapper: {
    flex: 1,
  },
  modeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
  },
  modeButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
