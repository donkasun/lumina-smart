import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '@/constants/theme';

export type EventType = 'RING' | 'PERSON' | 'MOTION';

export interface DoorbellEvent {
  id: string;
  type: EventType;
  label: string;
  subtitle?: string;
  time: string;
}

interface SwipeableEventRowProps {
  event: DoorbellEvent;
  onDelete?: (id: string) => void;
}

const BADGE_COLORS: Record<EventType, string> = {
  RING: '#FF7D54',
  PERSON: '#8B5CF6',
  MOTION: '#F59E0B',
};

const SWIPE_THRESHOLD = -40; // px; if released past this, row stays open
const DELETE_BUTTON_WIDTH = 64;

/**
 * SwipeableEventRow
 *
 * Renders a single doorbell event with:
 * - A gradient thumbnail placeholder (48x36)
 * - Typed badge (RING / PERSON / MOTION) with matching color
 * - Event label + relative timestamp
 * - Swipe-left gesture to reveal a 64pt red delete button
 * - For RING events: animated pulse ring around the thumbnail
 */
export const SwipeableEventRow: React.FC<SwipeableEventRowProps> = ({ event, onDelete }) => {
  // --- Swipe gesture ---
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      // Clamp to [-80, 0] — only allow left swipe
      translateX.value = Math.max(-80, Math.min(0, e.translationX));
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        // Snap open to reveal full delete button
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH, { damping: 20, stiffness: 200 });
      } else {
        // Snap back closed
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // --- RING pulse ring (scale + opacity loop) ---
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.7);

  useEffect(() => {
    if (event.type !== 'RING') return;

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 800 }),
        withTiming(1, { duration: 0 })
      ),
      -1
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 800 }),
        withTiming(0.7, { duration: 0 })
      ),
      -1
    );
  }, [event.type, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleDelete = () => {
    translateX.value = withSpring(0);
    onDelete?.(event.id);
  };

  const badgeColor = BADGE_COLORS[event.type];

  const typeIconName = event.type === 'RING' ? 'bell.fill' : event.type === 'PERSON' ? 'person.fill' : 'sensor.fill';

  return (
    <View style={styles.container}>
      {/* Delete button revealed on swipe-left */}
      <View style={styles.deleteButtonWrapper}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      {/* Swipeable row content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.row, rowStyle]}>
          {/* Circular thumbnail with optional pulse ring and type icon overlay */}
          <View style={styles.thumbnailWrapper}>
            {event.type === 'RING' && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  { borderColor: badgeColor },
                  pulseStyle,
                ]}
              />
            )}
            <LinearGradient
              colors={['rgba(100,116,139,0.6)', 'rgba(30,41,59,0.9)']}
              style={styles.thumbnail}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.typeIconOverlay, { backgroundColor: badgeColor }]}>
              <IconSymbol name={typeIconName as any} size={14} color="#FFFFFF" />
            </View>
          </View>

          {/* Text content: title, optional subtitle, time */}
          <View style={styles.content}>
            <Text style={styles.label} numberOfLines={1}>
              {event.label}
            </Text>
            {event.subtitle != null && event.subtitle !== '' && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {event.subtitle}
              </Text>
            )}
            <Text style={styles.time}>{event.time}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 14,
  },

  // Delete button (behind the row)
  deleteButtonWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  // Thumbnail (circular)
  thumbnailWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  typeIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },

  // Text area
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },
  subtitle: {
    color: '#9BA1A6',
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  time: {
    color: '#9BA1A6',
    fontSize: 11,
    fontFamily: Typography.regular,
  },
});
