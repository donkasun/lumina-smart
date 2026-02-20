export const INTERNAL_LOCK_ORANGE = '#FF9500';
export const EXTERNAL_LOCK_GREEN = '#10B981';

export function isExternalDoor(name: string): boolean {
  const n = name.toLowerCase();
  return /door|front|back|main|entrance|gate|entry/.test(n);
}

export function getLockAccent(isExternal: boolean): string {
  return isExternal ? EXTERNAL_LOCK_GREEN : INTERNAL_LOCK_ORANGE;
}

export const RIPPLE_SIZE = 120;
export const RIPPLE_COUNT = 4;
export const RIPPLE_SCALE_START = 0.35;
export const RIPPLE_SCALE_END = 1.45;
export const RIPPLE_OPACITY_START = 0.55;
export const RIPPLE_LOOP_DURATION_MS = 6000;
export const DASHED_RING_SPIN_DURATION_MS = 20000;

export const DIGITAL_KEYS = [
  {
    id: 'owner',
    name: 'Kasun (Owner)',
    badge: 'ADMIN',
    badgeBg: 'blue',
    icon: 'person.fill',
    schedule: null,
    hasChevron: true,
  },
  {
    id: 'help',
    name: 'House Help',
    badge: null,
    badgeBg: null,
    icon: 'cleaning.services',
    schedule: 'Mon-Fri • 8am-5pm',
    hasChevron: false,
  },
  {
    id: 'otp',
    name: 'Delivery OTP',
    badge: null,
    badgeBg: null,
    icon: 'package.2',
    schedule: 'Expiring in 5m',
    scheduleAlert: true,
    hasChevron: false,
  },
] as const;

export type DigitalKeyId = (typeof DIGITAL_KEYS)[number]['id'];

/** Internal door: access-rule time windows (hours in 24h format). Lock auto-unlocks during these windows when the rule is ON. */
export const PASSAGE_START_HOUR = 8;  // 8AM
export const PASSAGE_END_HOUR = 20;   // 8PM (exclusive: 19:59 is still unlocked)
export const CLEANING_START_HOUR = 10; // 10AM
export const CLEANING_END_HOUR = 11;   // 11AM (exclusive)

/** True if current time is in an unlock window for the given rules (internal door). */
export function isInUnlockWindow(
  passageOn: boolean,
  cleaningOn: boolean,
  now: Date = new Date()
): boolean {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeMinutes = hour * 60 + minute;
  if (passageOn) {
    const start = PASSAGE_START_HOUR * 60;
    const end = PASSAGE_END_HOUR * 60;
    if (timeMinutes >= start && timeMinutes < end) return true;
  }
  if (cleaningOn) {
    const start = CLEANING_START_HOUR * 60;
    const end = CLEANING_END_HOUR * 60;
    if (timeMinutes >= start && timeMinutes < end) return true;
  }
  return false;
}
