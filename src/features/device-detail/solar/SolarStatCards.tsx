import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GRID_GREEN, SECONDARY_BLUE } from './solarConstants';

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  statIconCircleYellow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234,179,8,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleYellowDark: {
    backgroundColor: 'rgba(234,179,8,0.25)',
  },
  statIconCircleGreen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleGreenDark: {
    backgroundColor: 'rgba(16,185,129,0.25)',
  },
  statIconCircleBlue: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircleBlueDark: {
    backgroundColor: 'rgba(59,130,246,0.25)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 0.5,
  },
  batteryBarWrap: {
    width: '100%',
    marginTop: 4,
  },
  batteryBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  batteryBarFill: {
    height: '100%',
    backgroundColor: GRID_GREEN,
    borderRadius: 2,
  },
});

interface SolarStatCardsProps {
  cardBg: string;
  textColor: string;
  subtextColor: string;
  batteryBarBg: string;
  isDark: boolean;
}

export function SolarStatCards({
  cardBg,
  textColor,
  subtextColor,
  batteryBarBg,
  isDark,
}: SolarStatCardsProps) {
  return (
    <View style={styles.statsGrid}>
      <GlassCard style={[styles.statCard, { backgroundColor: cardBg }]}>
        <View style={[styles.statIconCircleYellow, isDark && styles.statIconCircleYellowDark]}>
          <IconSymbol name="account_balance_wallet" size={20} color="#CA8A04" />
        </View>
        <Text style={[styles.statValue, { color: textColor }]}>$3.50</Text>
        <Text style={[styles.statLabel, { color: subtextColor }]}>SAVED TODAY</Text>
      </GlassCard>

      <GlassCard style={[styles.statCard, { backgroundColor: cardBg }]}>
        <View style={[styles.statIconCircleGreen, isDark && styles.statIconCircleGreenDark]}>
          <IconSymbol name="battery.75percent" size={20} color={GRID_GREEN} />
        </View>
        <Text style={[styles.statValue, { color: textColor }]}>85%</Text>
        <View style={styles.batteryBarWrap}>
          <View style={[styles.batteryBarBg, { backgroundColor: batteryBarBg }]}>
            <View style={[styles.batteryBarFill, { width: '85%' }]} />
          </View>
        </View>
        <Text style={[styles.statLabel, { color: subtextColor }]}>BATTERY</Text>
      </GlassCard>

      <GlassCard style={[styles.statCard, { backgroundColor: cardBg }]}>
        <View style={[styles.statIconCircleBlue, isDark && styles.statIconCircleBlueDark]}>
          <IconSymbol name="power_settings_new" size={20} color={SECONDARY_BLUE} />
        </View>
        <Text style={[styles.statValue, { color: textColor }]}>12.4</Text>
        <Text style={[styles.statLabel, { color: subtextColor }]}>KWH YIELD</Text>
      </GlassCard>
    </View>
  );
}
