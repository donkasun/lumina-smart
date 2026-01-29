import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FrostedScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * Full-screen wrapper that renders a frosted background (BlurView on iOS, overlay on Android)
 * so that when this screen slides in (e.g. stack push), the layer moves with it and covers
 * the previous screen, avoiding content overlap during the transition.
 */
export function FrostedScreenWrapper({ children, style, ...props }: FrostedScreenWrapperProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, style]} {...props}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={95}
          tint={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFillObject, styles.background]}
          pointerEvents="none"
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.background,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' },
          ]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    backgroundColor: 'transparent',
  },
});
