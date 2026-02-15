import React from 'react';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device } from '@/src/store/useDeviceStore';
import { haptics } from '@/src/utils/haptics';
import { CameraEvent, EventRow } from './EventRow';
import { PRIMARY } from './constants';

const MOCK_EVENTS: CameraEvent[] = [
  { type: 'Motion Detected', time: '2 minutes ago', thumbnail: null },
  { type: 'Person Detected', time: '14 minutes ago', thumbnail: null },
  { type: 'Vehicle Detected', time: '1 hour ago', thumbnail: null },
];

export interface ActionButtonProps {
  icon: string;
  label: string;
  bg: string;
  iconColor: string;
  labelColor: string;
  border?: string;
  shadow?: object;
  onPress?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  bg,
  iconColor,
  labelColor,
  border,
  shadow,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 120 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };
  const handlePress = () => {
    haptics.press();
    onPress?.();
  };

  return (
    <Animated.View style={[styles.actionButtonWrapper, anim]}>
      <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.actionButtonPressable}>
        <View
          style={[
            styles.actionCircle,
            { backgroundColor: bg },
            border ? { borderWidth: 1, borderColor: border } : {},
            shadow as object,
          ]}
        >
          <IconSymbol name={icon as any} size={24} color={iconColor} />
        </View>
        <Text style={[styles.actionLabel, { color: labelColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

export const CameraDetail: React.FC<{ device: Device }> = ({ device }) => {
  const subtextColor = useThemeColor({}, 'icon');

  const recOpacity = useSharedValue(1);
  React.useEffect(() => {
    recOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [recOpacity]);

  const recDotStyle = useAnimatedStyle(() => ({
    opacity: recOpacity.value,
  }));

  const ACTION_BUTTONS: ActionButtonProps[] = [
    { icon: 'mic', label: 'Talk', bg: PRIMARY, iconColor: '#FFF', labelColor: '#FFF', shadow: Shadows.primaryUnderglow },
    { icon: 'photo_camera', label: 'Snapshot', bg: '#F3F4F6', iconColor: '#374151', labelColor: '#374151', shadow: {} },
    { icon: 'video.fill', label: 'Record', bg: '#F3F4F6', iconColor: '#374151', labelColor: '#374151', shadow: {} },
    {
      icon: 'notification_important',
      label: 'Alarm',
      bg: 'rgba(239,68,68,0.10)',
      iconColor: '#EF4444',
      labelColor: '#EF4444',
      border: '#EF4444',
      shadow: {},
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.feedHeroWrapper}>
        {device.image ? (
          <ImageBackground source={device.image} style={styles.feedHero} imageStyle={styles.feedHeroImage}>
            <LinearGradient
              colors={['rgba(0,0,0,0.50)', 'transparent', 'rgba(0,0,0,0.30)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.feedBadgeRow}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <View style={styles.recBadge}>
                <Animated.View style={[styles.recDot, recDotStyle]} />
                <Text style={styles.recBadgeText}>REC</Text>
              </View>
            </View>
            <View style={styles.hdBadge}>
              <Text style={styles.hdText}>HD 1080p</Text>
            </View>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </ImageBackground>
        ) : (
          <View style={[styles.feedHero, styles.feedHeroFallback]}>
            <IconSymbol name="video.fill" size={48} color="#64748B" />
          </View>
        )}
      </View>
      <GlassCard style={styles.actionCard}>
        <View style={styles.actionRow}>
          {ACTION_BUTTONS.map((btn) => (
            <ActionButton key={btn.label} {...btn} />
          ))}
        </View>
      </GlassCard>
      <View style={styles.eventsSection}>
        <Text style={[styles.eventsTitle, { color: subtextColor }]}>RECENT EVENTS</Text>
        <FlatList
          data={MOCK_EVENTS}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item, index }) => (
            <EventRow event={item} style={index === MOCK_EVENTS.length - 1 ? { opacity: 0.7 } : undefined} />
          )}
          scrollEnabled={false}
        />
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
  feedHeroWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    ...(Shadows.section as object),
  },
  feedHero: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  feedHeroImage: {
    borderRadius: 20,
  },
  feedHeroFallback: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    top: 12,
    left: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  recBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  hdBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.40)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hdText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  actionCard: {
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonWrapper: {
    alignItems: 'center',
  },
  actionButtonPressable: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  eventsSection: {
    gap: 8,
  },
  eventsTitle: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
