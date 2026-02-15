import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PRIMARY } from './constants';

const HUMIDITY_BLUE = '#3B82F6';

export interface ThermostatInfoCardProps {
  iconName: string;
  iconVariant: 'blue' | 'primary';
  label: string;
  children: React.ReactNode;
}

export const ThermostatInfoCard: React.FC<ThermostatInfoCardProps> = ({
  iconName,
  iconVariant,
  label,
  children,
}) => {
  const subtextColor = useThemeColor({}, 'icon');
  const iconColor = iconVariant === 'blue' ? HUMIDITY_BLUE : PRIMARY;

  return (
    <GlassCard style={styles.card}>
      <View style={styles.left}>
        <View
          style={[
            styles.iconCircle,
            iconVariant === 'blue' ? styles.iconCircleBlue : styles.iconCirclePrimary,
          ]}
        >
          <IconSymbol name={iconName as any} size={20} color={iconColor} />
        </View>
        <Text style={[styles.label, { color: subtextColor }]}>{label}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  left: {
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBlue: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  iconCirclePrimary: {
    backgroundColor: 'rgba(255,125,84,0.15)',
  },
  label: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
});
