import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getTimeBasedGreeting } from '../../utils/date';
import { WeatherPill } from './WeatherPill';

export const DashboardHeader: React.FC = () => {
  const greeting = getTimeBasedGreeting('Kasun');

  return (
    <View style={styles.container}>
      <View style={styles.headerLeft}>
        <ThemedText style={styles.date}>Lumina Smart</ThemedText>
        <ThemedText type="title" style={styles.greeting}>{greeting}</ThemedText>
      </View>

      <WeatherPill />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    gap: 2,
  },
  date: {
    fontSize: 12,
    lineHeight: 12,
    opacity: 0.6,
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 20,
    lineHeight: 20,
    marginTop: 4,
  },
});