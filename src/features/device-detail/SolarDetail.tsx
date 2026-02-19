import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Device } from '@/src/store/useDeviceStore';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SolarChartCard } from './solar/SolarChartCard';
import { SolarFlowCard } from './solar/SolarFlowCard';
import { SolarHealthFooter } from './solar/SolarHealthFooter';
import { SolarStatCards } from './solar/SolarStatCards';

const styles = StyleSheet.create({
  section: {
    gap: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
});

export const SolarDetail: React.FC<{ device: Device }> = ({ device }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border' as any) ?? 'rgba(0,0,0,0.08)';
  const accentColor = useThemeColor({}, 'accent');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cardBg = surfaceColor;
  const flowSolarBg = isDark ? 'rgba(255,125,84,0.2)' : 'rgba(255,125,84,0.12)';
  const flowGridBg = isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.12)';
  const batteryBarBg = useThemeColor({}, 'border');

  return (
    <View style={styles.section}>
      <SolarFlowCard
        device={device}
        cardBg={cardBg}
        flowSolarBg={flowSolarBg}
        flowGridBg={flowGridBg}
        accentColor={accentColor}
        subtextColor={subtextColor}
      />
      <SolarChartCard
        cardBg={cardBg}
        textColor={textColor}
        subtextColor={subtextColor}
      />
      <SolarStatCards
        cardBg={cardBg}
        textColor={textColor}
        subtextColor={subtextColor}
        batteryBarBg={batteryBarBg ?? ''}
        isDark={isDark}
      />
      <SolarHealthFooter
        surfaceColor={surfaceColor}
        borderColor={borderColor as string}
        textColor={textColor}
      />
    </View>
  );
};
