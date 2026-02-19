import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device } from '@/src/store/useDeviceStore';
import { LineChart } from 'react-native-gifted-charts';

const CHART_WIDTH = Dimensions.get('window').width - 32 - 32;

const SolarPanelIcon =
  require('../../../assets/icons/solar-panel.svg').default ??
  require('../../../assets/icons/solar-panel.svg');

const SOLAR_ORANGE = '#FF7D54';
const GRID_GREEN = '#10B981';
const SECONDARY_BLUE = '#3B82F6';

// Chart data: solar production (peak midday) and usage (flatter, slightly declining)
const SOLAR_VALUES = [20, 45, 90, 85, 50, 25];
const USAGE_VALUES = [75, 72, 68, 70, 72, 75];

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

  const chartDataSets = useMemo(
    () => [
      {
        data: SOLAR_VALUES.map((value) => ({ value })),
        color: SOLAR_ORANGE,
        areaChart: true,
        startFillColor: SOLAR_ORANGE,
        endFillColor: SOLAR_ORANGE,
        startOpacity: 0.2,
        endOpacity: 0,
      },
      {
        data: USAGE_VALUES.map((value) => ({ value })),
        color: SECONDARY_BLUE,
        strokeDashArray: [6, 4],
      },
    ],
    []
  );

  return (
    <View style={styles.section}>
      {/* Energy flow: Solar → Home → Grid (icons on one line) */}
      <GlassCard style={[styles.flowCard, { backgroundColor: cardBg }]}>
        <View style={styles.flowIconRow}>
          <View style={styles.flowIconSlot}>
            <View style={[styles.flowIconWrapSmall, { backgroundColor: flowSolarBg }]}>
              <SolarPanelIcon width={32} height={32} color={SOLAR_ORANGE} />
            </View>
          </View>
          <View style={styles.flowLineWrapper}>
            <View style={[styles.flowLine, styles.flowLineOrange]}>
              <View style={[styles.flowDot, styles.flowDotOrange]} />
            </View>
          </View>
          <View style={styles.flowIconSlot}>
            <View style={[styles.flowIconHome, { backgroundColor: accentColor }]}>
              <IconSymbol name="house.fill" size={36} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.flowLineWrapper}>
            <View style={[styles.flowLine, styles.flowLineGreen]}>
              <View style={[styles.flowDot, styles.flowDotGreen]} />
            </View>
          </View>
          <View style={styles.flowIconSlot}>
            <View style={[styles.flowIconWrapSmall, { backgroundColor: flowGridBg }]}>
              <IconSymbol name="bolt.fill" size={28} color={GRID_GREEN} />
            </View>
          </View>
        </View>
        <View style={styles.flowLabelsRow}>
          <View style={styles.flowBlock}>
            <Text style={[styles.flowLabelSmall, { color: subtextColor }]}>SOLAR</Text>
            <Text style={styles.flowValueSolar}>{device.value ?? '1.4'} kW</Text>
          </View>
          <View style={styles.flowBlockSpacer} />
          <View style={styles.flowBlock}>
            <Text style={[styles.flowLabelSmall, { color: subtextColor }]}>GRID</Text>
            <View style={styles.flowBadgeGreen}>
              <Text style={styles.flowBadgeText}>Exporting 0.6 kW</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Production vs. Consumption */}
      <GlassCard style={[styles.chartCard, { backgroundColor: cardBg }]}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.chartTitle, { color: textColor }]}>
              Production vs. Consumption
            </Text>
            <Text style={[styles.chartSubtitle, { color: subtextColor }]}>
              Real-time balancing
            </Text>
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: SOLAR_ORANGE }]} />
              <Text style={[styles.legendText, { color: subtextColor }]}>SOLAR</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: SECONDARY_BLUE }]} />
              <Text style={[styles.legendText, { color: subtextColor }]}>USAGE</Text>
            </View>
          </View>
        </View>
        <View style={styles.chartWrap}>
          <LineChart
            dataSet={chartDataSets}
            height={176}
            width={CHART_WIDTH}
            spacing={Math.max(40, (CHART_WIDTH - 32) / (chartDataSets[0].data.length - 1))}
            initialSpacing={16}
            endSpacing={16}
            hideDataPoints
            hideRules
            hideYAxisText
            noOfSections={4}
            curved
            scrollable={false}
            isAnimated
            animationDuration={800}
          />
        </View>
        <View style={styles.xLabels}>
          <Text style={[styles.xLabel, { color: subtextColor }]}>06:00</Text>
          <Text style={[styles.xLabel, { color: subtextColor }]}>12:00</Text>
          <Text style={[styles.xLabel, { color: subtextColor }]}>18:00</Text>
        </View>
      </GlassCard>

      {/* Stat cards: Saved Today, Battery, kWh Yield */}
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

      {/* System Health footer */}
      <View
        style={[
          styles.healthCard,
          { backgroundColor: surfaceColor, borderColor: borderColor as string },
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
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  flowCard: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  flowIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
  },
  flowIconSlot: {
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  flowLabelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  flowBlock: {
    alignItems: 'center',
    gap: 2,
    width: 70,
  },
  flowBlockSpacer: {
    width: 70,
  },
  flowIconWrapSmall: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowIconHome: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  flowLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
  },
  flowValueSolar: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: SOLAR_ORANGE,
  },
  flowBadgeGreen: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: GRID_GREEN,
  },
  flowLineWrapper: {
    flex: 1,
    minWidth: 24,
    maxWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLineOrange: {
    backgroundColor: 'rgba(255,125,84,0.35)',
  },
  flowLineGreen: {
    backgroundColor: 'rgba(16,185,129,0.35)',
  },
  flowDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: '50%',
    marginLeft: -4,
  },
  flowDotOrange: {
    backgroundColor: SOLAR_ORANGE,
    shadowColor: SOLAR_ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  flowDotGreen: {
    backgroundColor: GRID_GREEN,
    shadowColor: GRID_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  chartCard: {
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: Typography.regular,
    marginTop: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 0.5,
  },
  chartWrap: {
    height: 176,
    marginHorizontal: -8,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  xLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 0.5,
  },
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
