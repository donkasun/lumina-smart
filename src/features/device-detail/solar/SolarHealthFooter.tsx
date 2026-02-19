import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GRID_GREEN } from './solarConstants';

const styles = StyleSheet.create({
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  healthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  healthIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  healthCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GRID_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface SolarHealthFooterProps {
  surfaceColor: string;
  borderColor: string;
  textColor: string;
}

export function SolarHealthFooter({
  surfaceColor,
  borderColor,
  textColor,
}: SolarHealthFooterProps) {
  return (
    <View
      style={[
        styles.healthCard,
        { backgroundColor: surfaceColor, borderColor },
      ]}
    >
      <View style={styles.healthLeft}>
        <View style={styles.healthIconCircle}>
          <IconSymbol name="verified" size={18} color={GRID_GREEN} />
        </View>
        <Text style={[styles.healthTitle, { color: textColor }]}>
          System Health: Optimal
        </Text>
      </View>
      <View style={styles.healthCheckCircle}>
        <IconSymbol name="check" size={16} color="#FFFFFF" />
      </View>
    </View>
  );
}
