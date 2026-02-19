import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DIGITAL_KEYS, type DigitalKeyId } from './lockConstants';

interface LockDigitalKeysProps {
  keyEnabled: Record<string, boolean>;
  setKeyEnabled: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  powerOn: boolean;
  cardBg: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
  tintColor: string;
  statusInfoColor: string;
  statusAlertColor: string;
}

export function LockDigitalKeys({
  keyEnabled,
  setKeyEnabled,
  powerOn,
  cardBg,
  borderColor,
  textColor,
  subtextColor,
  tintColor,
  statusInfoColor,
  statusAlertColor,
}: LockDigitalKeysProps) {
  return (
    <View style={[!powerOn && styles.disabled]} pointerEvents={powerOn ? 'auto' : 'none'}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Digital Keys</Text>
        <Text style={[styles.seeAll, { color: tintColor }]}>See all</Text>
      </View>
      <View style={styles.list}>
        {DIGITAL_KEYS.map((key) => (
          <GlassCard key={key.id} style={[styles.keyCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.keyLeft}>
              <View
                style={[
                  styles.keyIconWrap,
                  {
                    backgroundColor:
                      key.badgeBg === 'blue'
                        ? `${statusInfoColor}20`
                        : key.icon === 'cleaning.services'
                          ? `${tintColor}15`
                          : `${subtextColor}15`,
                  },
                ]}
              >
                <IconSymbol
                  name={key.icon}
                  size={24}
                  color={
                    key.badgeBg === 'blue'
                      ? statusInfoColor
                      : key.icon === 'cleaning.services'
                        ? tintColor
                        : subtextColor
                  }
                />
              </View>
              <View style={styles.keyTextWrap}>
                <Text style={[styles.keyName, { color: textColor }]}>{key.name}</Text>
                {key.badge && (
                  <View style={[styles.badge, { backgroundColor: `${statusInfoColor}20` }]}>
                    <Text style={[styles.badgeText, { color: statusInfoColor }]}>{key.badge}</Text>
                  </View>
                )}
                {key.schedule && !key.badge && (
                  <Text
                    style={[
                      styles.keySchedule,
                      { color: 'scheduleAlert' in key && key.scheduleAlert ? statusAlertColor : subtextColor },
                    ]}
                  >
                    {key.schedule}
                  </Text>
                )}
              </View>
            </View>
            {key.hasChevron ? (
              <IconSymbol name="chevron.right" size={20} color={subtextColor} />
            ) : (
              <AnimatedToggle
                value={keyEnabled[key.id as DigitalKeyId] ?? false}
                onChange={() => powerOn && setKeyEnabled((p) => ({ ...p, [key.id]: !p[key.id] }))}
              />
            )}
          </GlassCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  keyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  keyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  keyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyTextWrap: {
    flex: 1,
    gap: 2,
  },
  keyName: {
    fontSize: 14,
    fontFamily: Typography.bold,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: Typography.bold,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  keySchedule: {
    fontSize: 11,
    fontFamily: Typography.medium,
  },
});
