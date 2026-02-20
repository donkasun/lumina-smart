import { Typography } from '@/constants/theme';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import {
  CHART_WIDTH,
  SECONDARY_BLUE,
  SOLAR_ORANGE,
  SOLAR_VALUES,
  USAGE_VALUES,
} from './solarConstants';

const styles = StyleSheet.create({
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
    flexDirection: 'column',
    gap: 6,
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
    minHeight: 220,
    marginHorizontal: -8,
    overflow: 'visible',
  },
});

interface SolarChartCardProps {
  cardBg: string;
  textColor: string;
  subtextColor: string;
}

const X_AXIS_LABELS: string[] = Array(25).fill('');
X_AXIS_LABELS[0] = '0';
X_AXIS_LABELS[6] = '6';
X_AXIS_LABELS[12] = '12';
X_AXIS_LABELS[18] = '18';
X_AXIS_LABELS[24] = '24';

export function SolarChartCard({ cardBg, textColor, subtextColor }: SolarChartCardProps) {
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
          maxValue={8}
          spacing={Math.max(10, (CHART_WIDTH - 32) / (chartDataSets[0].data.length - 1))}
          initialSpacing={12}
          endSpacing={12}
          hideDataPoints
          noOfSections={4}
          yAxisTextStyle={{ fontSize: 9, color: subtextColor }}
          xAxisLabelTexts={X_AXIS_LABELS}
          xAxisLabelTextStyle={{ fontSize: 9, color: subtextColor }}
          curved
          isAnimated
          animationDuration={800}
        />
      </View>
    </GlassCard>
  );
}
