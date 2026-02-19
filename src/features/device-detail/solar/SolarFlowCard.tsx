import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device } from '@/src/store/useDeviceStore';
import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FlowTrackDot } from './FlowTrackDot';
import { FLOW_SLOT_WIDTH, SOLAR_ORANGE } from './solarConstants';

const SolarPanelIcon =
  require('../../../../assets/icons/solar-panel.svg').default ??
  require('../../../../assets/icons/solar-panel.svg');

const styles = StyleSheet.create({
  flowCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  flowRowContainer: {
    position: 'relative',
    minHeight: 72,
  },
  flowTrack: {
    position: 'absolute',
    left: FLOW_SLOT_WIDTH,
    right: FLOW_SLOT_WIDTH,
    top: '50%',
    marginTop: -10,
    height: 20,
    zIndex: 0,
    overflow: 'visible',
    justifyContent: 'center',
  },
  flowTrackLine: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  flowTrackLeft: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(255,125,84,0.35)',
  },
  flowTrackRight: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(16,185,129,0.35)',
  },
  flowIconRow: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
  },
  flowIconSlot: {
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
  },
  flowIconSlotCenter: {
    height: undefined,
    justifyContent: 'center',
  },
  flowLineSpacer: {
    flex: 1,
    minWidth: 24,
    maxWidth: 56,
  },
  flowLabelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 2,
  },
  flowBlock: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    width: 70,
  },
  flowIconWrapSmall: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowIconHomeWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowIconHomeGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    left: -8,
    top: -8,
  },
  flowIconHome: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  flowCenterLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
    marginTop: 4,
    textAlign: 'center',
  },
  flowLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  flowBadgeSolar: {
    backgroundColor: 'rgba(255,125,84,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'center',
  },
  flowBadgeTextSolar: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: SOLAR_ORANGE,
  },
  flowBadgeGreen: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    alignSelf: 'center',
  },
  flowBadgeText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: '#10B981',
  },
});

interface SolarFlowCardProps {
  device: Device;
  cardBg: string;
  flowSolarBg: string;
  flowGridBg: string;
  accentColor: string;
  subtextColor: string;
}

export function SolarFlowCard({
  device,
  cardBg,
  flowSolarBg,
  flowGridBg,
  accentColor,
  subtextColor,
}: SolarFlowCardProps) {
  const [flowRowWidth, setFlowRowWidth] = useState(0);
  const flowTrackWidth = Math.max(0, flowRowWidth - 2 * FLOW_SLOT_WIDTH);

  const thumbProgress = useSharedValue(0);
  const homeGlowPulse = useSharedValue(0);
  const prevThumbProgress = useSharedValue(-1);

  useAnimatedReaction(
    () => thumbProgress.value,
    (cur) => {
      if (prevThumbProgress.value < 0.5 && cur >= 0.5) {
        homeGlowPulse.value = withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        );
      }
      prevThumbProgress.value = cur;
      if (cur <= 0) prevThumbProgress.value = -1;
    }
  );

  const homeGlowStyle = useAnimatedStyle(() => {
    'worklet';
    const scale = 1 + 0.12 * homeGlowPulse.value;
    const backgroundColor = interpolateColor(
      homeGlowPulse.value,
      [0, 1],
      ['rgba(180,180,180,0.2)', SOLAR_ORANGE]
    );
    const opacity = 0.2 + 0.25 * homeGlowPulse.value;
    return { transform: [{ scale }], backgroundColor, opacity };
  });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setFlowRowWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <GlassCard style={[styles.flowCard, { backgroundColor: cardBg }]}>
      <View style={styles.flowRowContainer} onLayout={onLayout}>
        <View style={styles.flowTrack}>
          <View style={styles.flowTrackLine}>
            <View style={styles.flowTrackLeft} />
            <View style={styles.flowTrackRight} />
          </View>
          <FlowTrackDot trackWidth={flowTrackWidth} progressRef={thumbProgress} />
        </View>
        <View style={styles.flowIconRow}>
          <View style={styles.flowIconSlot}>
            <View style={[styles.flowIconWrapSmall, { backgroundColor: flowSolarBg }]}>
              <SolarPanelIcon width={32} height={32} color={SOLAR_ORANGE} />
            </View>
          </View>
          <View style={styles.flowLineSpacer} />
          <View style={[styles.flowIconSlot, styles.flowIconSlotCenter]}>
            <View style={styles.flowIconHomeWrapper}>
              <Animated.View style={[styles.flowIconHomeGlow, homeGlowStyle]} />
              <View style={[styles.flowIconHome, { backgroundColor: accentColor }]}>
                <IconSymbol name="house.fill" size={36} color="#FFFFFF" />
              </View>
            </View>
          </View>
          <View style={styles.flowLineSpacer} />
          <View style={styles.flowIconSlot}>
            <View style={[styles.flowIconWrapSmall, { backgroundColor: flowGridBg }]}>
              <IconSymbol name="bolt.fill" size={28} color="#10B981" />
            </View>
          </View>
        </View>
      </View>
      <View style={styles.flowLabelsRow}>
        <View style={styles.flowBlock}>
          <Text style={[styles.flowLabelSmall, { color: subtextColor }]}>SOLAR</Text>
          <View style={styles.flowBadgeSolar}>
            <Text style={styles.flowBadgeTextSolar}>{device.value ?? '1.4'} kW</Text>
          </View>
        </View>
        <View style={styles.flowBlock}>
          <Text style={[styles.flowCenterLabel, { color: subtextColor }]}>
            Self Sufficient
          </Text>
        </View>
        <View style={styles.flowBlock}>
          <Text style={[styles.flowLabelSmall, { color: subtextColor }]}>GRID</Text>
          <View style={styles.flowBadgeGreen}>
            <Text style={styles.flowBadgeText}>Exporting 0.6 kW</Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}
