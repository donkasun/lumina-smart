import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LockAcProtectionProps {
  cardBg: string;
  borderColor: string;
  textColor: string;
  statusOnColor: string;
  statusInfoColor: string;
}

export function LockAcProtection({
  cardBg,
  borderColor,
  textColor,
  statusOnColor,
  statusInfoColor,
}: LockAcProtectionProps) {
  return (
    <GlassCard style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${statusInfoColor}15` }]}>
        <IconSymbol name="ac_unit" size={22} color={statusInfoColor} />
      </View>
      <Text style={[styles.title, { color: textColor }]}>AC Protection</Text>
      <View style={[styles.pill, { backgroundColor: `${statusOnColor}20` }]}>
        <Text style={[styles.pillText, { color: statusOnColor }]}>Door Closed</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
});
