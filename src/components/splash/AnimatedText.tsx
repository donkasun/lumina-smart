import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedTextProps {
  text: string;
  startDelay?: number;
  letterDelay?: number;
  style?: any;
}

/**
 * Letter-by-letter animated text reveal
 * Each letter animates in with scale and opacity
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startDelay = 0,
  letterDelay = 50,
  style,
}) => {
  const letters = text.split('');

  return (
    <View style={styles.container}>
      {letters.map((letter, index) => (
        <AnimatedLetter
          key={index}
          letter={letter}
          delay={startDelay + index * letterDelay}
          style={style}
        />
      ))}
    </View>
  );
};

interface AnimatedLetterProps {
  letter: string;
  delay: number;
  style?: any;
}

const AnimatedLetter: React.FC<AnimatedLetterProps> = ({ letter, delay, style }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      })
    );

    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 15,
        stiffness: 150,
      })
    );

    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    );
  }, [delay, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.letter, style]}>{letter === ' ' ? '\u00A0' : letter}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: Typography.bold,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
