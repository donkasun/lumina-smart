import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { DashboardCategories } from '@/src/features/dashboard/DashboardCategories';
import { DashboardGrid } from '@/src/features/dashboard/DashboardGrid';
import { DashboardHeader } from '@/src/features/dashboard/DashboardHeader';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const textColor = useThemeColor({}, 'text');
  
  const backgroundColor = useThemeColor({}, 'background');
  // const backgroundColor = 'red';
  // const backgroundColor = 'gray';

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
  },
  content: {
    flexGrow: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
