import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function UsageScreen() {
  return (
    <View style={styles.container}>
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
