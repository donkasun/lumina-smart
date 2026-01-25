import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function UsageScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText type="title">Usage Statistics</ThemedText>
      <ThemedText style={styles.subtitle}>Coming Soon</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.5,
  },
});
