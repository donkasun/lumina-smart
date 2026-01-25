import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { DashboardHeader } from '@/src/features/dashboard/DashboardHeader';
import { DashboardGrid } from '@/src/features/dashboard/DashboardGrid';

export default function DashboardScreen() {
  return (
    <ScrollView 
      style={styles.container} 
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