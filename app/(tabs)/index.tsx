import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { DashboardHeader } from '@/src/features/dashboard/DashboardHeader';
import { DashboardGrid } from '@/src/features/dashboard/DashboardGrid';
import { DashboardCategories } from '@/src/features/dashboard/DashboardCategories';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function DashboardScreen() {
  const textColor = useThemeColor({}, 'text');
  
  return (
    <ScrollView 
      style={styles.container} 
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
