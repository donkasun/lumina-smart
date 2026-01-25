import { useThemeColor } from '@/hooks/use-theme-color';
import { DashboardGrid } from '@/src/features/dashboard/DashboardGrid';
import { DashboardHeader } from '@/src/features/dashboard/DashboardHeader';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {

  const backgroundColor = useThemeColor({}, 'background');
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader />
      <DashboardGrid />
      {/* Spacer for floating tab bar */}
      <View style={{ height: 100 }} />
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
});