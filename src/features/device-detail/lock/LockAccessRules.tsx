import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { INTERNAL_LOCK_ORANGE } from './lockConstants';

interface LockAccessRulesProps {
  powerOn: boolean;
  passageOn: boolean;
  cleaningOn: boolean;
  setPassageOn: React.Dispatch<React.SetStateAction<boolean>>;
  setCleaningOn: React.Dispatch<React.SetStateAction<boolean>>;
  cardBg: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
}

export function LockAccessRules({
  powerOn,
  passageOn,
  cleaningOn,
  setPassageOn,
  setCleaningOn,
  cardBg,
  borderColor,
  textColor,
  subtextColor,
}: LockAccessRulesProps) {
  return (
    <View style={!powerOn && styles.disabled} pointerEvents={powerOn ? 'auto' : 'none'}>
      <Text style={[styles.header, { color: subtextColor }]}>ACCESS RULES</Text>
      <View style={styles.list}>
        <GlassCard style={[styles.ruleCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.ruleIconWrap, { backgroundColor: `${INTERNAL_LOCK_ORANGE}18` }]}>
            <IconSymbol name="light_mode" size={24} color={INTERNAL_LOCK_ORANGE} />
          </View>
          <View style={styles.ruleTextWrap}>
            <Text style={[styles.ruleTitle, { color: textColor }]}>Passage Mode</Text>
            <Text style={[styles.ruleDetail, { color: subtextColor }]}>Unlocked 8AM - 8PM</Text>
          </View>
          <AnimatedToggle
            value={passageOn}
            onChange={() => powerOn && setPassageOn((p) => !p)}
            activeColor={INTERNAL_LOCK_ORANGE}
          />
        </GlassCard>
        <GlassCard style={[styles.ruleCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.ruleIconWrap, { backgroundColor: `${subtextColor}18` }]}>
            <IconSymbol name="cleaning.services" size={24} color={subtextColor} />
          </View>
          <View style={styles.ruleTextWrap}>
            <Text style={[styles.ruleTitle, { color: textColor }]}>Cleaning Access</Text>
            <Text style={[styles.ruleDetail, { color: subtextColor }]}>Daily 10AM - 11AM</Text>
          </View>
          <AnimatedToggle
            value={cleaningOn}
            onChange={() => powerOn && setCleaningOn((p) => !p)}
            activeColor={INTERNAL_LOCK_ORANGE}
          />
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  header: {
    fontSize: 10,
    fontFamily: Typography.bold,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  list: {
    gap: 10,
    marginBottom: 12,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  ruleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTextWrap: {
    flex: 1,
    gap: 2,
  },
  ruleTitle: {
    fontSize: 15,
    fontFamily: Typography.bold,
    fontWeight: '600',
  },
  ruleDetail: {
    fontSize: 12,
    fontFamily: Typography.medium,
  },
});
