import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { Shadows } from '@/constants/shadows';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  className?: string;
}

const styles = StyleSheet.create({
  glass: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
  },
  androidGlass: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
  },
});

/**
 * A glassmorphism component that handles platform differences:
 * - iOS: Uses native BlurView for a real-time blur effect.
 * - Android: Uses a semi-transparent background with a subtle border
 *   to mimic the glass look without the high performance cost of blur.
 */
export const GlassView: React.FC<GlassViewProps> = ({
  children,
  intensity = 100,
  tint = 'default',
  style,
  ...props
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.35)';

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.glass,
          {
            backgroundColor: isDark ? 'rgba(30, 30, 30, 0.70)' : 'rgba(255, 255, 255, 0.70)',
            borderColor,
            ...(Shadows.card as object),
          },
          style,
        ]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  // Android implementation (Faux Glass)
  return (
    <View
      style={[
        styles.androidGlass,
        {
          backgroundColor: isDark
            ? 'rgba(30, 30, 30, 0.70)'
            : 'rgba(255, 255, 255, 0.70)',
          borderColor,
          ...(Shadows.card as object),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
