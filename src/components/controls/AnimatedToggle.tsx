import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/src/utils/haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

const TOGGLE_WIDTH = 68;
const TOGGLE_HEIGHT = 36;
const THUMB_SIZE = 24;
const THUMB_PADDING = 6;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({ value, onChange, label }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');

  const progress = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);
  const thumbBounce = useSharedValue(1);

  React.useEffect(() => {
    // Overdamped spring: no overshoot on translation
    progress.value = withSpring(value ? 1 : 0, {
      damping: 38,
      stiffness: 300,
    });
    // Bounce scale on arrival
    thumbBounce.value = withSequence(
      withTiming(1.22, { duration: 120 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );
  }, [value, progress, thumbBounce]);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = progress.value * (TOGGLE_WIDTH - THUMB_SIZE - THUMB_PADDING * 2);
    return {
      transform: [
        { translateX },
        { scale: scale.value * thumbBounce.value },
      ],
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [surfaceColor, accentColor]
    );
    return { backgroundColor };
  });

  const handlePress = () => {
    haptics.toggle();
    onChange(!value);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.toggle, containerAnimatedStyle, trackShadow]}
      >
        <Animated.View style={[styles.thumbContainer, thumbAnimatedStyle, thumbShadow]}>
          <View style={styles.thumb} />
        </Animated.View>

        <View style={styles.labelContainer}>
          <Text style={[styles.onOffText, { opacity: value ? 1 : 0, color: '#FFFFFF' }]}>
            ON
          </Text>
          <Text style={[styles.onOffText, { opacity: !value ? 1 : 0, color: textColor }]}>
            OFF
          </Text>
        </View>
      </AnimatedPressable>
    </View>
  );
};

const trackShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
}) ?? {};

const thumbShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.19,
    shadowRadius: 4,
  },
  android: { elevation: 3 },
}) ?? {};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  toggle: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: TOGGLE_HEIGHT / 2,
    padding: THUMB_PADDING,
    position: 'relative',
  },
  thumbContainer: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    position: 'absolute',
    left: THUMB_PADDING,
    top: THUMB_PADDING,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
  thumb: {
    flex: 1,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF',
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  onOffText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: Typography.bold,
    letterSpacing: 0.5,
  },
});
