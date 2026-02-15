import { CameraCarousel } from '@/src/features/dashboard/CameraCarousel';
import { DashboardCategories } from '@/src/features/dashboard/DashboardCategories';
import { DashboardGrid } from '@/src/features/dashboard/DashboardGrid';
import { DashboardHeader } from '@/src/features/dashboard/DashboardHeader';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Match tab bar height in (tabs)/_layout so content clears the bar. */
const TAB_BAR_HEIGHT = 50;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16) + TAB_BAR_HEIGHT;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
    >
      <DashboardHeader />
      <DashboardCategories />
      <CameraCarousel />
      <DashboardGrid />
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
