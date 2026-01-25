import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getTimeBasedGreeting } from '../../utils/date';
import { WeatherPill } from './WeatherPill';

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    lineHeight: 24,
    marginTop: 4,
    fontWeight: '700',
  },
  extraContent: {
    marginTop: 20,
  },
});

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ children }) => {
  const greeting = getTimeBasedGreeting('Kasun');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.date}>Lumina Smart</ThemedText>
          <ThemedText type="title" style={[styles.greeting, { color: textColor }]}>{greeting}</ThemedText>
        </View>

        <WeatherPill />
      </View>

      {children && (
        <View style={styles.extraContent}>
          {children}
        </View>
      )}
    </View>
  );
};
