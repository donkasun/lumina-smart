import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const LockIconSvg =
  require('../../../assets/icons/door-lock.svg')?.default ?? require('../../../assets/icons/door-lock.svg');

const DIGITAL_KEYS = [
  { id: 'owner', name: 'Kasun (Owner)', badge: 'ADMIN', badgeBg: 'blue', icon: 'person.fill', schedule: null, hasChevron: true },
  { id: 'help', name: 'House Help', badge: null, badgeBg: null, icon: 'cleaning.services', schedule: 'Mon-Fri • 8am-5pm', hasChevron: false },
  { id: 'otp', name: 'Delivery OTP', badge: null, badgeBg: null, icon: 'package.2', schedule: 'Expiring in 5m', scheduleAlert: true, hasChevron: false },
] as const;

const INTERNAL_PRIMARY_ORANGE = '#FF9500';
const EXTERNAL_PRIMARY_GREEN = '#10B981';

function isExternalDoor(name: string): boolean {
  const n = name.toLowerCase();
  return /door|front|back|main|entrance|gate|entry/.test(n);
}

interface LockDetailProps {
  device: Device;
}

export const LockDetail: React.FC<LockDetailProps> = ({ device }) => {
  const setDeviceOn = useDeviceStore((s) => s.setDeviceOn);
  const setLocked = useDeviceStore((s) => s.setLocked);
  const [keyEnabled, setKeyEnabled] = useState<Record<string, boolean>>({ help: true, otp: false });
  const [passageOn, setPassageOn] = useState(true);
  const [cleaningOn, setCleaningOn] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const statusOnColor = useThemeColor({}, 'statusOn');
  const statusAlertColor = useThemeColor({}, 'statusAlert');
  const tintColor = useThemeColor({}, 'tint');
  const statusInfoColor = useThemeColor({}, 'statusInfo');

  const isExternal = isExternalDoor(device.name);
  const batteryPct = device.batteryLevel ?? 82;
  const powerOn = device.isOn;
  const locked = device.type === 'lock' ? device.value === 1 : device.isOn;

  const spin = useSharedValue(0);
  React.useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);
  }, [spin]);
  const dashedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const pulseProgress = useSharedValue(0);
  const pulseActive = useSharedValue(0);
  const pulseRunning = locked && powerOn;
  const lockAccent = isExternal ? EXTERNAL_PRIMARY_GREEN : INTERNAL_PRIMARY_ORANGE;
  React.useEffect(() => {
    if (pulseRunning) {
      pulseActive.value = 1;
      pulseProgress.value = 0;
      pulseProgress.value = withRepeat(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseActive.value = 0;
      cancelAnimation(pulseProgress);
      pulseProgress.value = 0;
    }
  }, [pulseRunning, pulseProgress, pulseActive]);
  const RIPPLE_SIZE = 120;
  const RIPPLE_COUNT = 4;
  const RIPPLE_SCALE_START = 0.35;
  const RIPPLE_SCALE_END = 1.45;
  const RIPPLE_OPACITY_START = 0.55;
  // Ripple: each circle has an "age" (time since it started). All 4 run in parallel so 3–4 are visible at once.
  const useRippleCircleStyle = (segmentIndex: number) =>
    useAnimatedStyle(() => {
      'worklet';
      if (pulseActive.value < 0.5) {
        return { transform: [{ scale: RIPPLE_SCALE_START }], opacity: 0 };
      }
      const progress = pulseProgress.value;
      const segmentStart = segmentIndex / RIPPLE_COUNT;
      const age = (progress - segmentStart + 1) % 1;
      const eased = 1 - (1 - age) * (1 - age);
      const scale = RIPPLE_SCALE_START + (RIPPLE_SCALE_END - RIPPLE_SCALE_START) * eased;
      const opacity = age <= 1 ? RIPPLE_OPACITY_START * (1 - age) : 0;
      return {
        transform: [{ scale }],
        opacity,
      };
    });
  const internalRippleStyle0 = useRippleCircleStyle(0);
  const internalRippleStyle1 = useRippleCircleStyle(1);
  const internalRippleStyle2 = useRippleCircleStyle(2);
  const internalRippleStyle3 = useRippleCircleStyle(3);

  const statusTitle = locked
    ? (isExternal ? 'Securely Locked' : 'Locked')
    : 'Unlocked';
  const statusSubtitle = locked
    ? (isExternal ? 'Auto-lock engaged via Timer' : 'Manual lock')
    : 'Tap to lock';

  const cardBg = surfaceColor;
  const centerIconName = isExternal ? 'shield.fill' : 'lock.fill';
  const LockIcon = device.image ?? LockIconSvg;
  const LockIconComponent = LockIcon?.default ?? LockIcon;

  // Internal door (bedroom/office): device card + Privacy hero + Access Rules + AC Protection
  if (!isExternal) {
    const privacyOn = locked;
    const heroIconColor = privacyOn ? lockAccent : subtextColor;
    const deviceLockIconColor = locked ? lockAccent : subtextColor;
    return (
      <View style={styles.section}>
        {/* Device card with on/off toggle */}
        <GlassCard style={[styles.deviceCard, { backgroundColor: cardBg }]}>
          <View style={[styles.deviceIconWrap, { backgroundColor: locked ? `${lockAccent}20` : `${subtextColor}15` }]}>
            {typeof LockIconComponent === 'function' ? (
              <LockIconComponent width={32} height={32} color={deviceLockIconColor} />
            ) : (
              <IconSymbol name="door.front.door" size={32} color={deviceLockIconColor} />
            )}
          </View>
          <View style={styles.deviceNameWrap}>
            <Text style={[styles.deviceName, { color: textColor }]} numberOfLines={1}>
              {device.name}
            </Text>
            <Text style={[styles.deviceSub, { color: subtextColor }]}>
              Battery {batteryPct}% · {powerOn ? 'On' : 'Off'} · {locked ? 'Locked' : 'Unlocked'}
            </Text>
          </View>
          <AnimatedToggle
            value={powerOn}
            onChange={() => setDeviceOn(device.id, !powerOn)}
            activeColor={lockAccent}
          />
        </GlassCard>

        {/* Hero: Privacy Control */}
        <GlassCard style={[styles.internalHeroCard, { backgroundColor: cardBg }]}>
          <View style={styles.internalStatusRingWrap}>
            <Animated.View style={[styles.internalDashedRing, { borderColor: borderColor }, dashedRingStyle]} />
            <View style={[styles.internalHeroIconWrap, { width: RIPPLE_SIZE, height: RIPPLE_SIZE }]}>
              <Animated.View
                style={[
                  styles.internalPulseCircle,
                  { backgroundColor: privacyOn ? `${lockAccent}50` : `${subtextColor}30` },
                  internalRippleStyle0,
                ]}
              />
              <Animated.View
                style={[
                  styles.internalPulseCircle,
                  { backgroundColor: privacyOn ? `${lockAccent}50` : `${subtextColor}30` },
                  internalRippleStyle1,
                ]}
              />
              <Animated.View
                style={[
                  styles.internalPulseCircle,
                  { backgroundColor: privacyOn ? `${lockAccent}50` : `${subtextColor}30` },
                  internalRippleStyle2,
                ]}
              />
              <Animated.View
                style={[
                  styles.internalPulseCircle,
                  { backgroundColor: privacyOn ? `${lockAccent}50` : `${subtextColor}30` },
                  internalRippleStyle3,
                ]}
              />
              <View style={styles.internalHeroIconCenter}>
                {typeof LockIconComponent === 'function' ? (
                  <LockIconComponent width={64} height={64} color={heroIconColor} />
                ) : (
                  <IconSymbol name="door.front.door" size={64} color={heroIconColor} />
                )}
              </View>
            </View>
          </View>
          <Text style={[styles.internalHeroTitle, { color: textColor }]}>
            {privacyOn ? 'Privacy Enabled' : 'Privacy Disabled'}
          </Text>
          <Text style={[styles.internalHeroSubtext, { color: subtextColor }]}>
            {privacyOn
              ? 'Notifications muted. External codes disabled.'
              : 'Tap to enable privacy mode.'}
          </Text>
          <View style={[styles.lockUnlockRow, !powerOn && styles.lockUnlockDisabled]} pointerEvents={powerOn ? 'auto' : 'none'}>
            <Text style={[styles.lockUnlockLabel, { color: subtextColor }]}>{locked ? 'Locked' : 'Unlocked'}</Text>
            <AnimatedToggle
              value={locked}
              onChange={() => powerOn && setLocked(device.id, !locked)}
              activeColor={lockAccent}
              onLabel="Yes"
              offLabel="Now"
            />
          </View>
        </GlassCard>

        {/* Access Rules */}
        <View style={!powerOn && styles.accessRulesDisabled} pointerEvents={powerOn ? 'auto' : 'none'}>
          <Text style={[styles.accessRulesHeader, { color: subtextColor }]}>ACCESS RULES</Text>
          <View style={styles.accessRulesList}>
            <GlassCard style={[styles.accessRuleCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={[styles.accessRuleIconWrap, { backgroundColor: `${INTERNAL_PRIMARY_ORANGE}18` }]}>
                <IconSymbol name="light_mode" size={24} color={INTERNAL_PRIMARY_ORANGE} />
              </View>
              <View style={styles.accessRuleTextWrap}>
                <Text style={[styles.accessRuleTitle, { color: textColor }]}>Passage Mode</Text>
                <Text style={[styles.accessRuleDetail, { color: subtextColor }]}>Unlocked 8AM - 8PM</Text>
              </View>
              <AnimatedToggle
                value={passageOn}
                onChange={() => powerOn && setPassageOn((p) => !p)}
                activeColor={INTERNAL_PRIMARY_ORANGE}
              />
            </GlassCard>
            <GlassCard style={[styles.accessRuleCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={[styles.accessRuleIconWrap, { backgroundColor: `${subtextColor}18` }]}>
                <IconSymbol name="cleaning.services" size={24} color={subtextColor} />
              </View>
              <View style={styles.accessRuleTextWrap}>
                <Text style={[styles.accessRuleTitle, { color: textColor }]}>Cleaning Access</Text>
                <Text style={[styles.accessRuleDetail, { color: subtextColor }]}>Daily 10AM - 11AM</Text>
              </View>
              <AnimatedToggle
                value={cleaningOn}
                onChange={() => powerOn && setCleaningOn((p) => !p)}
                activeColor={INTERNAL_PRIMARY_ORANGE}
              />
            </GlassCard>
          </View>
        </View>

        {/* AC Protection */}
        <GlassCard style={[styles.acProtectionCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.acProtectionIconWrap, { backgroundColor: `${statusInfoColor}15` }]}>
            <IconSymbol name="ac_unit" size={22} color={statusInfoColor} />
          </View>
          <Text style={[styles.acProtectionTitle, { color: textColor }]}>AC Protection</Text>
          <View style={[styles.doorClosedPill, { backgroundColor: `${statusOnColor}20` }]}>
            <Text style={[styles.doorClosedPillText, { color: statusOnColor }]}>Door Closed</Text>
          </View>
        </GlassCard>
      </View>
    );
  }

  // External (main) door: device card + same hero card with main-door copy and green accent
  const heroIconColor = locked ? lockAccent : subtextColor;
  const deviceLockIconColor = locked ? lockAccent : subtextColor;
  return (
    <View style={styles.section}>
      <GlassCard style={[styles.deviceCard, { backgroundColor: cardBg }]}>
        <View style={[styles.deviceIconWrap, { backgroundColor: locked ? `${lockAccent}20` : `${subtextColor}15` }]}>
          {typeof LockIconComponent === 'function' ? (
            <LockIconComponent width={32} height={32} color={deviceLockIconColor} />
          ) : (
            <IconSymbol name="lock.fill" size={32} color={deviceLockIconColor} />
          )}
        </View>
        <View style={styles.deviceNameWrap}>
          <Text style={[styles.deviceName, { color: textColor }]} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={[styles.deviceSub, { color: subtextColor }]}>
            Battery {batteryPct}% · {powerOn ? 'On' : 'Off'} · {locked ? 'Locked' : 'Unlocked'}
          </Text>
        </View>
        <AnimatedToggle
          value={powerOn}
          onChange={() => setDeviceOn(device.id, !powerOn)}
          activeColor={lockAccent}
        />
      </GlassCard>

      <GlassCard style={[styles.internalHeroCard, { backgroundColor: cardBg }]}>
        <View style={styles.internalStatusRingWrap}>
          <Animated.View style={[styles.internalDashedRing, { borderColor: borderColor }, dashedRingStyle]} />
          <View style={[styles.internalHeroIconWrap, { width: RIPPLE_SIZE, height: RIPPLE_SIZE }]}>
            <Animated.View
              style={[
                styles.internalPulseCircle,
                { backgroundColor: locked ? `${lockAccent}50` : `${subtextColor}30` },
                internalRippleStyle0,
              ]}
            />
            <Animated.View
              style={[
                styles.internalPulseCircle,
                { backgroundColor: locked ? `${lockAccent}50` : `${subtextColor}30` },
                internalRippleStyle1,
              ]}
            />
            <Animated.View
              style={[
                styles.internalPulseCircle,
                { backgroundColor: locked ? `${lockAccent}50` : `${subtextColor}30` },
                internalRippleStyle2,
              ]}
            />
            <Animated.View
              style={[
                styles.internalPulseCircle,
                { backgroundColor: locked ? `${lockAccent}50` : `${subtextColor}30` },
                internalRippleStyle3,
              ]}
            />
            <View style={styles.internalHeroIconCenter}>
              {typeof LockIconComponent === 'function' ? (
                <LockIconComponent width={64} height={64} color={heroIconColor} />
              ) : (
                <IconSymbol name={centerIconName} size={64} color={heroIconColor} />
              )}
            </View>
          </View>
        </View>
        <Text style={[styles.internalHeroTitle, { color: textColor }]}>{statusTitle}</Text>
        <Text style={[styles.internalHeroSubtext, { color: subtextColor }]}>{statusSubtitle}</Text>
        <View style={[styles.lockUnlockRow, !powerOn && styles.lockUnlockDisabled]} pointerEvents={powerOn ? 'auto' : 'none'}>
          <Text style={[styles.lockUnlockLabel, { color: subtextColor }]}>{locked ? 'Locked' : 'Unlocked'}</Text>
          <AnimatedToggle
            value={locked}
            onChange={() => powerOn && setLocked(device.id, !locked)}
            activeColor={lockAccent}
            onLabel="Yes"
            offLabel="Now"
          />
        </View>
      </GlassCard>

      <View style={[!powerOn && styles.keysSectionDisabled]} pointerEvents={powerOn ? 'auto' : 'none'}>
        <View style={styles.keysHeader}>
          <Text style={[styles.keysTitle, { color: textColor }]}>Digital Keys</Text>
          <Text style={[styles.seeAll, { color: tintColor }]}>See all</Text>
        </View>
        <View style={styles.keyList}>
          {DIGITAL_KEYS.map((key) => (
            <GlassCard key={key.id} style={[styles.keyCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.keyLeft}>
                <View style={[styles.keyIconWrap, { backgroundColor: key.badgeBg === 'blue' ? `${statusInfoColor}20` : key.icon === 'cleaning.services' ? `${tintColor}15` : `${subtextColor}15` }]}>
                  <IconSymbol
                    name={key.icon}
                    size={24}
                    color={key.badgeBg === 'blue' ? statusInfoColor : key.icon === 'cleaning.services' ? tintColor : subtextColor}
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
                    <Text style={[styles.keySchedule, { color: 'scheduleAlert' in key && key.scheduleAlert ? statusAlertColor : subtextColor }]}>
                      {key.schedule}
                    </Text>
                  )}
                </View>
              </View>
              {key.hasChevron ? (
                <IconSymbol name="chevron.right" size={20} color={subtextColor} />
              ) : (
                <AnimatedToggle
                  value={keyEnabled[key.id] ?? false}
                  onChange={() => powerOn && setKeyEnabled((p) => ({ ...p, [key.id]: !p[key.id] }))}
                />
              )}
            </GlassCard>
          ))}
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
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 32,
    gap: 16,
  },
  deviceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceNameWrap: {
    flex: 1,
    gap: 2,
  },
  deviceName: {
    fontSize: 18,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  deviceSub: {
    fontSize: 14,
    fontFamily: Typography.medium,
  },
  statusCard: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 8,
  },
  statusRingWrap: {
    width: 224,
    height: 224,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dashedRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 112,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  statusCircleOuter: {
    width: 192,
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  statusCircleInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
  },
  statusCircleInnerGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontFamily: Typography.bold,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: Typography.medium,
    marginBottom: 16,
  },
  lockUnlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lockUnlockLabel: {
    fontSize: 14,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  lockUnlockDisabled: {
    opacity: 0.5,
  },
  keysSectionDisabled: {
    opacity: 0.5,
  },
  keysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keysTitle: {
    fontSize: 18,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  keyList: {
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
  // Internal (bedroom/office) lock
  internalHeroCard: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 8,
  },
  internalStatusRingWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  internalDashedRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  internalHeroIconWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  internalPulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  internalHeroIconCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  internalHeroTitle: {
    fontSize: 26,
    fontFamily: Typography.bold,
    fontWeight: '700',
    marginBottom: 6,
  },
  internalHeroSubtext: {
    fontSize: 14,
    fontFamily: Typography.medium,
    marginBottom: 20,
    textAlign: 'center',
  },
  accessRulesHeader: {
    fontSize: 10,
    fontFamily: Typography.bold,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  accessRulesDisabled: {
    opacity: 0.5,
  },
  accessRulesList: {
    gap: 10,
    marginBottom: 12,
  },
  accessRuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  accessRuleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessRuleTextWrap: {
    flex: 1,
    gap: 2,
  },
  accessRuleTitle: {
    fontSize: 15,
    fontFamily: Typography.bold,
    fontWeight: '600',
  },
  accessRuleDetail: {
    fontSize: 12,
    fontFamily: Typography.medium,
  },
  acProtectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  acProtectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acProtectionTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  doorClosedPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  doorClosedPillText: {
    fontSize: 12,
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
});
