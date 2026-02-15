import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function BackgroundBlobs() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const tint = isDark ? 'dark' : 'light';

  // Android: expo-blur can be inconsistent; use plain semi-transparent views (Design Guide Option B)
  if (Platform.OS === 'android') {
    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={[styles.warmBlob, isDark && styles.warmBlobDark]} />
        <View style={[styles.coolBlob, isDark && styles.coolBlobDark]} />
      </View>
    );
  }

  // iOS: BlurView blurs content behind it for soft edges; backgroundColor adds the warm/cool tint (Design Guide §2)
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <BlurView
        intensity={80}
        tint={tint}
        style={[styles.warmBlob, isDark && styles.warmBlobDark]}
      />
      <BlurView
        intensity={60}
        tint={tint}
        style={[styles.coolBlob, isDark && styles.coolBlobDark]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // iOS BlurView blobs (blur radius ~100pt / ~80pt per Design Guide)
  warmBlob: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 500,
    height: 500,
    borderRadius: 250,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 125, 84, 0.15)',
  },
  warmBlobDark: { backgroundColor: 'rgba(255, 125, 84, 0.22)' },
  coolBlob: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    overflow: 'hidden',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  coolBlobDark: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
});
