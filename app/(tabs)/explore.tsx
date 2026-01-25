import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import { NeomorphButton } from '@/src/components/ui/NeomorphButton';
import { DeviceCard } from '@/src/features/dashboard/DeviceCard';

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
                  <NeomorphButton 
                    onPress={() => console.log('Cool pressed!')}
                    width={60}
                    height={60}
                    borderRadius={10}
                  >
                    <Text style={styles.icon}>❄️</Text>
                    <Text style={styles.label}>COOL</Text>
                  </NeomorphButton>
                  <DeviceCard device={{
          id: '1',
          name: 'Cool',
          type: 'ac',
          isOn: false,
          value: 0,
        }} onPress={() => console.log('Device pressed!')} />
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
    // backgroundColor: 'red',
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