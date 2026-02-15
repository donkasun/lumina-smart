import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Defs, Path, Stop, Svg, LinearGradient as SvgGradient } from 'react-native-svg';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device } from '@/src/store/useDeviceStore';
import { PRIMARY } from './constants';

const SOLAR_DATA = [80, 75, 40, 20, 50, 70];
const SOLAR_X_LABELS = ['06:00', '10:00', '14:00', '18:00', '22:00'];

export const SolarDetail: React.FC<{ device: Device }> = ({ device }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border' as any) ?? 'rgba(0,0,0,0.08)';

  const glowOpacity = useSharedValue(0.2);
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const recOpacity = useSharedValue(1);
  React.useEffect(() => {
    recOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [recOpacity]);
  const recDotStyle = useAnimatedStyle(() => ({ opacity: recOpacity.value }));

  const { linePath, areaPath } = useMemo(() => {
    const w = 100;
    const h = 100;
    const pts = SOLAR_DATA.map((v, i) => ({
      x: (i / (SOLAR_DATA.length - 1)) * w,
      y: h - (v / 100) * h,
    }));
    const makeQCurve = (points: { x: number; y: number }[]) => {
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const cx = (points[i - 1].x + points[i].x) / 2;
        const cy = (points[i - 1].y + points[i].y) / 2;
        d += ` Q ${points[i - 1].x} ${points[i - 1].y} ${cx} ${cy}`;
      }
      d += ` Q ${points[points.length - 2].x} ${points[points.length - 2].y} ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
      return d;
    };
    const curve = makeQCurve(pts);
    const area = `${curve} L ${w} ${h} L 0 ${h} Z`;
    return { linePath: curve, areaPath: area };
  }, []);

  return (
    <View style={styles.section}>
      <GlassCard style={styles.solarHeroCard}>
        <View style={styles.solarLiveBadge}>
          <Animated.View style={[styles.solarLiveDot, recDotStyle]} />
          <Text style={styles.solarLiveText}>LIVE</Text>
        </View>
        <View style={styles.solarIconWrapper}>
          <Animated.View style={[styles.solarGlow, glowStyle]} />
          <View style={styles.solarIconCircle}>
            <IconSymbol name="solar_power" size={60} color={PRIMARY} />
          </View>
        </View>
        <Text style={[styles.solarHeroLabel, { color: subtextColor }]}>Real-time Production</Text>
        <View style={styles.solarValueRow}>
          <Text style={[styles.solarValue, { color: textColor }]}>{device.value}</Text>
          <Text style={[styles.solarUnit, { color: PRIMARY }]}>W</Text>
        </View>
        <View style={styles.solarMetricsRow}>
          <Text style={[styles.solarMetric, { color: subtextColor }]}>Efficiency 94%</Text>
          <View style={styles.solarDivider} />
          <Text style={[styles.solarMetric, { color: subtextColor }]}>Peak Today 1.8 kW</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionLabel, { color: subtextColor }]}>PRODUCTION HISTORY</Text>
          <View style={styles.chartTabs}>
            <View style={[styles.chartTab, styles.chartTabActive]}>
              <Text style={styles.chartTabActiveText}>Today</Text>
            </View>
            <Pressable>
              <View style={styles.chartTab}>
                <Text style={[styles.chartTabText, { color: subtextColor }]}>Week</Text>
              </View>
            </Pressable>
          </View>
        </View>
        <Svg viewBox="0 0 100 100" width="100%" height={160}>
          <Defs>
            <SvgGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={PRIMARY} stopOpacity="0.20" />
              <Stop offset="1" stopColor={PRIMARY} stopOpacity="0" />
            </SvgGradient>
          </Defs>
          <Path d={areaPath} fill="url(#solarGrad)" />
          <Path d={linePath} stroke={PRIMARY} strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>
        <View style={styles.xLabels}>
          {SOLAR_X_LABELS.map((l) => (
            <Text key={l} style={[styles.xLabel, { color: subtextColor }]}>
              {l}
            </Text>
          ))}
        </View>
      </GlassCard>

      <View style={styles.statsGrid}>
        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(251,146,60,0.15)' }]}>
            <IconSymbol name="bolt.fill" size={20} color="#F97316" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>12.4 kWh</Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Today</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
            <IconSymbol name="house.fill" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>8.2 kWh</Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Usage</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
            <IconSymbol name="grid_goldenratio" size={20} color="#22C55E" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>4.2 kWh</Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Grid</Text>
        </GlassCard>
      </View>

      <View
        style={[
          styles.healthCard,
          { backgroundColor: surfaceColor, borderColor: borderColor as string },
        ]}
      >
        <View style={styles.healthLeft}>
          <View style={styles.healthIconCircle}>
            <IconSymbol name="verified" size={22} color="#22C55E" />
          </View>
          <View style={styles.healthText}>
            <Text style={[styles.healthTitle, { color: textColor }]}>System Health</Text>
            <Text style={[styles.healthSubtitle, { color: subtextColor }]}>All 12 panels online</Text>
          </View>
        </View>
        <View style={styles.optimalBadge}>
          <View style={styles.optimalDot} />
          <Text style={styles.optimalText}>OPTIMAL</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  solarHeroCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    borderColor: 'rgba(255,125,84,0.10)',
    borderWidth: 1,
  },
  solarLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  solarLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  solarLiveText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  solarIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  solarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,125,84,0.25)',
  },
  solarIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,125,84,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solarHeroLabel: {
    fontSize: 14,
    fontFamily: Typography.regular,
  },
  solarValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  solarValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  solarUnit: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Typography.bold,
    paddingBottom: 8,
  },
  solarMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  solarMetric: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  solarDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  chartCard: {
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  chartTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartTabActive: {
    backgroundColor: PRIMARY,
  },
  chartTabActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  chartTabText: {
    fontSize: 11,
    fontFamily: Typography.regular,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    fontSize: 9,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Typography.regular,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthText: {
    gap: 2,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  healthSubtitle: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  optimalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  optimalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  optimalText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
});
