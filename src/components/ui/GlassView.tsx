import React from 'react';
import { StyleSheet, View, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  className?: string;
}

/**
 * A glassmorphism component that handles platform differences:
 * - iOS: Uses native BlurView for a real-time blur effect.
 * - Android: Uses a semi-transparent background with a subtle border 
 *   to mimic the glass look without the high performance cost of blur.
 */
export const GlassView: React.FC<GlassViewProps> = ({
  children,
  intensity = 40,
  tint = 'dark',
  style,
  ...props
}) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.glass, style]}
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
          backgroundColor: tint === 'dark' 
            ? 'rgba(30, 30, 30, 0.85)' 
            : 'rgba(255, 255, 255, 0.2)',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glass: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  androidGlass: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
  },
});
