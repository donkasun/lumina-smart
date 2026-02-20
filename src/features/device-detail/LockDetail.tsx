import { useThemeColor } from '@/hooks/use-theme-color';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getLockAccent,
  isExternalDoor,
  isInUnlockWindow,
  LockAcProtection,
  LockAccessRules,
  LockDeviceCard,
  LockDigitalKeys,
  LockHeroCard,
} from './lock';

interface LockDetailProps {
  device: Device;
}

export const LockDetail: React.FC<LockDetailProps> = ({ device }) => {
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
  const powerOn = device.isOn;
  const locked = device.type === 'lock' ? device.value === 1 : device.isOn;
  const lockAccent = getLockAccent(isExternal);
  const cardBg = surfaceColor;

  const statusTitle = locked
    ? (isExternal ? 'Securely Locked' : 'Locked')
    : 'Unlocked';
  const statusSubtitle = locked
    ? (isExternal ? 'Auto-lock engaged via Timer' : 'Manual lock')
    : 'Tap to lock';

  const handleLockToggle = () => {
    if (powerOn) setLocked(device.id, !locked);
  };

  // Internal door: auto lock/unlock from access rules (Passage 8AM–8PM, Cleaning 10–11AM)
  useEffect(() => {
    if (isExternal || !powerOn || (!passageOn && !cleaningOn)) return;
    const syncLockFromRules = () => {
      const shouldUnlock = isInUnlockWindow(passageOn, cleaningOn);
      setLocked(device.id, !shouldUnlock);
    };
    syncLockFromRules();
    const interval = setInterval(syncLockFromRules, 60_000);
    return () => clearInterval(interval);
  }, [isExternal, powerOn, passageOn, cleaningOn, device.id, setLocked]);

  if (!isExternal) {
    const heroTitle = locked ? 'Privacy Enabled' : 'Privacy Disabled';
    const heroSubtitle = locked
      ? 'Notifications muted. External codes disabled.'
      : 'Tap to enable privacy mode.';

    return (
      <View style={styles.section}>
        <LockDeviceCard
          device={device}
          lockAccent={lockAccent}
          isExternal={false}
          cardBg={cardBg}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <LockHeroCard
          device={device}
          locked={locked}
          powerOn={powerOn}
          onLockToggle={handleLockToggle}
          lockAccent={lockAccent}
          isExternal={false}
          title={heroTitle}
          subtitle={heroSubtitle}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <LockAccessRules
          powerOn={powerOn}
          passageOn={passageOn}
          cleaningOn={cleaningOn}
          setPassageOn={setPassageOn}
          setCleaningOn={setCleaningOn}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <LockAcProtection
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          statusOnColor={statusOnColor}
          statusInfoColor={statusInfoColor}
        />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <LockDeviceCard
        device={device}
        lockAccent={lockAccent}
        isExternal
        cardBg={cardBg}
        textColor={textColor}
        subtextColor={subtextColor}
      />
      <LockHeroCard
        device={device}
        locked={locked}
        powerOn={powerOn}
        onLockToggle={handleLockToggle}
        lockAccent={lockAccent}
        isExternal
        title={statusTitle}
        subtitle={statusSubtitle}
        cardBg={cardBg}
        borderColor={borderColor}
        textColor={textColor}
        subtextColor={subtextColor}
      />
      <LockDigitalKeys
        keyEnabled={keyEnabled}
        setKeyEnabled={setKeyEnabled}
        powerOn={powerOn}
        cardBg={cardBg}
        borderColor={borderColor}
        textColor={textColor}
        subtextColor={subtextColor}
        tintColor={tintColor}
        statusInfoColor={statusInfoColor}
        statusAlertColor={statusAlertColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
});
