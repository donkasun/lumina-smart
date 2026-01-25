import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DashboardCategories } from '@/src/features/dashboard/DashboardCategories';
import { DashboardGrid } from '@/src/features/dashboard/DashboardGrid';
import { DashboardHeader } from '@/src/features/dashboard/DashboardHeader';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader />
      <DashboardCategories />
      
      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Devices</ThemedText>
        <Pressable
          onPress={() => console.log('Add Device')}
          style={styles.addDeviceButton}
        >
          <IconSymbol name="slider.horizontal.3" size={18} color={iconColor} />
        </Pressable> 
      </View>
      
      <DashboardGrid />
      
      {/* Spacer for floating tab bar */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  addDeviceButton: {
    padding: 4,
    borderRadius: 4,
  },
});
