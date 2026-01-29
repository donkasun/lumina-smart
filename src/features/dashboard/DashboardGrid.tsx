import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { DeviceCategory, useDeviceStore } from '../../store/useDeviceStore';
import { DeviceCard } from './DeviceCard';
import { MusicPlayerCard } from './MusicPlayerCard';

const { width: windowWidth } = Dimensions.get('window');
// 16pt × 2 page padding, 12pt × 2 gaps between 3 columns
const CARD_WIDTH = (windowWidth - 32 - 24) / 3;

const CATEGORY_ORDER: DeviceCategory[] = ['comfort', 'security', 'entertainment'];
const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  comfort: 'COMFORT',
  security: 'SECURITY',
  entertainment: 'ENTERTAINMENT',
};

export const DashboardGrid: React.FC = memo(() => {
  const subtextColor = useThemeColor({}, 'subtext');
  const router = useRouter();
  const devices = useDeviceStore((state) => state.devices);

  const handleDevicePress = useCallback(
    (id: string) => {
      router.push(`/device/${id}`);
    },
    [router]
  );

  // Group devices by category (default → 'comfort')
  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = devices.filter((d) => (d.category ?? 'comfort') === cat);
      return acc;
    },
    {} as Record<DeviceCategory, typeof devices>
  );

  return (
    <View style={styles.container}>
      {CATEGORY_ORDER.map((cat) => {
        const catDevices = grouped[cat];
        const showSection = cat === 'entertainment' || catDevices.length > 0;
        if (!showSection) return null;

        // Build rows of 3
        const rows: (typeof devices)[] = [];
        for (let i = 0; i < catDevices.length; i += 3) {
          rows.push(catDevices.slice(i, i + 3));
        }

        return (
          <View key={cat} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: subtextColor }]}>
              {CATEGORY_LABELS[cat]}
            </Text>

            {cat === 'entertainment' && <MusicPlayerCard />}

            <View style={styles.grid}>
              {rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.row}>
                  {row.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onPress={() => handleDevicePress(device.id)}
                    />
                  ))}
                  {row.length < 3 &&
                    Array.from({ length: 3 - row.length }).map((_, i) => (
                      <View key={`empty-${i}`} style={{ width: CARD_WIDTH }} />
                    ))}
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
});

DashboardGrid.displayName = 'DashboardGrid';

const styles = StyleSheet.create({
  container: {
    gap: 0,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-start',
  },
});
