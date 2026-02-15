import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/src/utils/haptics';
import { Device } from '@/src/store/useDeviceStore';
import { DeviceCard } from './DeviceCard';

interface SwipeableDeviceCardProps {
  device: Device;
  onPress: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;
const ACTION_THRESHOLD = 120;

const SwipeableDeviceCardComponent: React.FC<SwipeableDeviceCardProps> = ({
  device,
  onPress,
  onDelete,
  onToggleFavorite,
}) => {
  const translateX = useSharedValue(0);
  const thresholdCrossed = useSharedValue(false);

  const triggerHaptic = () => {
    haptics.swipeThreshold();
  };

  const performDelete = () => {
    haptics.delete();
    onDelete(device.id);
  };

  const performFavorite = () => {
    haptics.favorite();
    onToggleFavorite(device.id);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;

      // Trigger haptic when crossing threshold
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD && !thresholdCrossed.value) {
        thresholdCrossed.value = true;
        runOnJS(triggerHaptic)();
      } else if (Math.abs(event.translationX) <= SWIPE_THRESHOLD && thresholdCrossed.value) {
        thresholdCrossed.value = false;
      }
    })
    .onEnd((event) => {
      // Left swipe (delete)
      if (event.translationX < -ACTION_THRESHOLD) {
        translateX.value = withTiming(-300, { duration: 200 }, () => {
          runOnJS(performDelete)();
        });
      }
      // Right swipe (favorite)
      else if (event.translationX > ACTION_THRESHOLD) {
        translateX.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(performFavorite)();
        });
        thresholdCrossed.value = false;
      }
      // Snap back
      else {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        thresholdCrossed.value = false;
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -SWIPE_THRESHOLD ?
      Math.min((-translateX.value - SWIPE_THRESHOLD) / (ACTION_THRESHOLD - SWIPE_THRESHOLD), 1) : 0,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > SWIPE_THRESHOLD ?
      Math.min((translateX.value - SWIPE_THRESHOLD) / (ACTION_THRESHOLD - SWIPE_THRESHOLD), 1) : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Left action (Delete) */}
      <Animated.View style={[styles.actionContainer, styles.deleteAction, leftActionStyle]}>
        <Ionicons name="trash-outline" size={24} color="#FF5252" />
      </Animated.View>

      {/* Right action (Favorite) */}
      <Animated.View style={[styles.actionContainer, styles.favoriteAction, rightActionStyle]}>
        <Ionicons
          name={device.isFavorite ? "star" : "star-outline"}
          size={24}
          color="#FFD700"
        />
      </Animated.View>

      {/* Swipeable Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={cardStyle}>
          <DeviceCard device={device} onPress={onPress} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

SwipeableDeviceCardComponent.displayName = 'SwipeableDeviceCard';

export const SwipeableDeviceCard = memo(SwipeableDeviceCardComponent);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  actionContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  deleteAction: {
    right: 0,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  favoriteAction: {
    left: 0,
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
});
