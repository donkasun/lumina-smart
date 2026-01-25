import { ThemedText } from '@/components/themed-text';
import { GlassButton } from '@/src/components/ui/GlassButton';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function ExploreScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ThemedText type="title">Settings & Automation</ThemedText>
        <ThemedText style={styles.subtitle}>Neumorphic Components</ThemedText>
      </SafeAreaView>

      <View style={styles.content}>
        <GlassButton 
          onPress={() => console.log('Cool pressed!')}
          width={60}
          height={60}
          borderRadius={10}
        >
          <Text style={styles.icon}>❄️</Text>
          <Text style={[styles.label, { color: textColor }]}>COOL</Text>
        </GlassButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    padding: 20,
    zIndex: 1,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 10,
    includeFontPadding: false,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  }
});