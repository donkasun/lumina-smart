import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device } from '@/src/store/useDeviceStore';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { PRIMARY } from './constants';
import { DoorbellFeed } from './DoorbellFeed';
import { DoorbellEvent, SwipeableEventRow } from './SwipeableEventRow';

// ---- Mock events ----
const INITIAL_EVENTS: DoorbellEvent[] = [
  { id: '1', type: 'RING', label: 'Doorbell Ring', subtitle: 'Someone is at the door', time: '2m ago' },
  { id: '2', type: 'PERSON', label: 'Person Detected', subtitle: 'Front garden area', time: '45m ago' },
  { id: '3', type: 'MOTION', label: 'Motion Detected', subtitle: 'Street periphery', time: '1h ago' },
];

// ---- Sensitivity levels ----
type Sensitivity = 'Low' | 'Med' | 'High';
const SENSITIVITY_OPTIONS: Sensitivity[] = ['Low', 'Med', 'High'];

const SEGMENTED_TRACK_PADDING = 6;
const SEGMENTED_PILL_BORDER_RADIUS = 18;

// ---- Animated segmented control for Motion Sensitivity ----
interface SensitivitySegmentedControlProps {
  value: Sensitivity;
  onChange: (value: Sensitivity) => void;
  textColor: string;
}

const SensitivitySegmentedControl: React.FC<SensitivitySegmentedControlProps> = ({
  value,
  onChange,
  textColor,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = SENSITIVITY_OPTIONS.indexOf(value);
  const translateX = useSharedValue(0);
  const hasAnimatedRef = React.useRef(false);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setTrackWidth(w);
  }, []);

  React.useEffect(() => {
    if (trackWidth <= 0) return;
    const segmentWidth = (trackWidth - SEGMENTED_TRACK_PADDING * 2) / 3;
    const targetX = SEGMENTED_TRACK_PADDING + selectedIndex * segmentWidth;
    if (!hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      translateX.value = targetX;
    } else {
      translateX.value = withSpring(targetX, { damping: 42, stiffness: 240 });
    }
  }, [trackWidth, selectedIndex, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (trackWidth <= 0) {
    return (
      <View style={styles.segmentedTrack} onLayout={onTrackLayout}>
        <View style={styles.segmentedSegmentsRow}>
          {SENSITIVITY_OPTIONS.map((opt) => (
            <Pressable key={opt} style={styles.segmentedSegment} onPress={() => onChange(opt)}>
              <Text style={[styles.segmentedLabel, { color: textColor }]}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const segmentWidth = (trackWidth - SEGMENTED_TRACK_PADDING * 2) / 3;

  return (
    <View style={styles.segmentedTrack} onLayout={onTrackLayout}>
      <Animated.View
        style={[
          styles.segmentedPill,
          {
            width: segmentWidth,
            borderRadius: SEGMENTED_PILL_BORDER_RADIUS,
          },
          pillStyle,
        ]}
      />
      <View style={styles.segmentedSegmentsRow} pointerEvents="box-none">
        {SENSITIVITY_OPTIONS.map((opt) => (
          <Pressable
            key={opt}
            style={styles.segmentedSegment}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[
                styles.segmentedLabel,
                { color: value === opt ? PRIMARY : textColor },
                value === opt && styles.segmentedLabelSelected,
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

// ---- Status card (single metric with label) ----
const STATUS_BATTERY_COLOR = '#22C55E';
const STATUS_SIGNAL_COLOR = '#3B82F6';
const STATUS_MOTION_COLOR = '#EF4444';

interface StatusCardProps {
  icon: string;
  value: string;
  label: string;
  iconColor: string;
  textColor: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, value, label, iconColor, textColor }) => (
  <View style={styles.statusCardInner}>
    <IconSymbol name={icon as any} size={24} color={iconColor} />
    <Text style={[styles.statusValue, { color: textColor }]}>{value}</Text>
    <Text style={[styles.statusLabel, { color: textColor }]}>{label}</Text>
  </View>
);

// ---- Floating bottom bar (exported for device screen) ----
export const DoorbellBottomBar: React.FC = () => (
  <View style={styles.bottomBar}>
    <Pressable style={styles.talkButton}>
      <IconSymbol name="mic" size={24} color="#FFFFFF" />
      <Text style={styles.talkButtonText}>Talk</Text>
    </Pressable>
    <View style={styles.bottomBarRight}>
      <Pressable style={styles.circleButton}>
        <IconSymbol name="video.slash.fill" size={22} color="#37451" />
      </Pressable>
      <Pressable style={styles.circleButton}>
        <IconSymbol name="speaker.wave.2.fill" size={22} color="#374151" />
      </Pressable>
    </View>
  </View>
);

// ---- Main component ----
export const DoorbellDetail: React.FC<{ device: Device; floatingBottomBar?: boolean }> = ({ device, floatingBottomBar }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');

  const [notificationsOn, setNotificationsOn] = useState(true);
  const [dndOn, setDndOn] = useState(false);
  const [sensitivity, setSensitivity] = useState<Sensitivity>('Med');
  const [events, setEvents] = useState<DoorbellEvent[]>(INITIAL_EVENTS);

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <View style={[styles.section, floatingBottomBar && styles.sectionWithFloatingBar]}>
      {/* ── 1. Live feed at top ── */}
      <DoorbellFeed />

      {/* ── 2. Doorbell Status: header + toggle, then three cards ── */}
      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
        <Text style={[styles.sectionTitle, styles.alertSectionTitle, { color: subtextColor }]}>Doorbell Status</Text>
          <View style={styles.statusHeaderRight}>
            <IconSymbol name="bell.fill" size={20} color={subtextColor} />
            <AnimatedToggle value={notificationsOn} onChange={setNotificationsOn} />
          </View>
        </View>
        <View style={styles.statusCardsRow}>
          <GlassCard style={styles.statusCardSingle}>
            <StatusCard icon="bolt.fill" value="78%" label="Battery" iconColor={STATUS_BATTERY_COLOR} textColor={textColor} />
          </GlassCard>
          <GlassCard style={styles.statusCardSingle}>
            <StatusCard icon="wifi" value="Strong" label="Signal" iconColor={STATUS_SIGNAL_COLOR} textColor={textColor} />
          </GlassCard>
          <GlassCard style={styles.statusCardSingle}>
            <StatusCard icon="sensor.fill" value="Active" label="Motion" iconColor={STATUS_MOTION_COLOR} textColor={textColor} />
          </GlassCard>
        </View>
      </View>

      {/* ── 3. Recent events (title + content in one wrapper) ── */}
      <View style={styles.sectionBlock}>
        <View style={styles.eventsHeader}>
          <Text style={[styles.sectionTitle, styles.eventsSectionTitle, { color: subtextColor }]}>RECENT EVENTS</Text>
          <Pressable hitSlop={8}>
            <Text style={[styles.viewAllLink, { color: PRIMARY }]}>View All</Text>
          </Pressable>
        </View>
        <GlassCard style={styles.eventsCard}>
          {events.map((event) => (
            <SwipeableEventRow key={event.id} event={event} onDelete={handleDeleteEvent} />
          ))}
          {events.length === 0 && (
            <Text style={[styles.emptyText, { color: subtextColor }]}>No recent events</Text>
          )}
        </GlassCard>
      </View>

      {/* ── 4. Alert settings (title + content in one wrapper) ── */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, styles.alertSectionTitle, { color: subtextColor }]}>ALERT SETTINGS</Text>
        <GlassCard style={styles.alertSettingCard}>
          <View style={styles.sensitivityRow}>
            <Text style={[styles.sensitivityLabel, { color: textColor }]}>Motion Sensitivity</Text>
            <SensitivitySegmentedControl
              value={sensitivity}
              onChange={setSensitivity}
              textColor="#5C6A7D"
            />
          </View>
        </GlassCard>
        <GlassCard style={styles.alertSettingCard}>
          <View style={styles.notifRow}>
            <View style={styles.dndLabelWrap}>
              <IconSymbol name="minus.circle.fill" size={22} color={subtextColor} />
              <View>
                <Text style={[styles.notifLabel, { color: textColor }]}>Do Not Disturb</Text>
                <Text style={[styles.dndSubtitle, { color: subtextColor }]}>Mute all doorbell rings</Text>
              </View>
            </View>
            <AnimatedToggle value={dndOn} onChange={setDndOn} />
          </View>
        </GlassCard>
      </View>

      {/* Bottom bar: inline only when not floating */}
      {!floatingBottomBar && <DoorbellBottomBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionWithFloatingBar: {
    paddingBottom: 24,
  },

  sectionBlock: {
    gap: 6,
  },

  // Doorbell status section
  statusSection: {
    gap: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // statusTitle: {
  //   fontSize: 11,
  //   fontWeight: '700',
  //   fontFamily: Typography.bold,
  // },
  statusHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusCardSingle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statusCardInner: {
    alignItems: 'center',
    gap: 6,
  },
  statusValue: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Typography.semiBold,
    opacity: 0.8,
  },

  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  dndLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dndSubtitle: {
    fontSize: 12,
    fontFamily: Typography.regular,
    marginTop: 2,
  },

  // Events (title outside, list in card)
  eventsSectionTitle: {
    marginBottom: 0,
  },
  eventsCard: {
    gap: 8,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: Typography.regular,
    textAlign: 'center',
    paddingVertical: 12,
  },

  // Alert settings (title outside, two separate cards)
  alertSectionTitle: {
    marginBottom: 4,
  },
  alertSettingCard: {
    gap: 10,
  },
  sensitivityRow: {
    gap: 10,
  },
  sensitivityLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  segmentedTrack: {
    height: 44,
    backgroundColor: '#F0F2F5',
    borderRadius: 22,
    padding: SEGMENTED_TRACK_PADDING,
    justifyContent: 'center',
    position: 'relative',
  },
  segmentedPill: {
    position: 'absolute',
    left: 0,
    top: SEGMENTED_TRACK_PADDING,
    height: 44 - SEGMENTED_TRACK_PADDING * 2,
    backgroundColor: '#FFFFFF',
  },
  segmentedSegmentsRow: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 1,
    height: 44 - SEGMENTED_TRACK_PADDING * 2,
  },
  segmentedSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Typography.semiBold,
  },
  segmentedLabelSelected: {
    fontWeight: '700',
    fontFamily: Typography.bold,
  },

  // Bottom control bar (also used by floating DoorbellBottomBar)
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  talkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8,
    backgroundColor: PRIMARY,
    borderRadius: 24,
  },
  talkButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  bottomBarRight: {
    flexDirection: 'row',
    gap: 10,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
