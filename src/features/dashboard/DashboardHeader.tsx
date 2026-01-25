import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { GlassView } from '../../components/ui/GlassView';
import { formatHeaderDate, getTimeBasedGreeting } from '../../utils/date';

export const DashboardHeader: React.FC = () => {
  const [showHumidity, setShowHumidity] = useState(false);
  const flipRotation = withSpring(showHumidity ? 180 : 0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${flipRotation}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${flipRotation - 180}deg` }],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  }));

  const dateString = formatHeaderDate();
  const greeting = getTimeBasedGreeting('Kasun');

  return (
    <View style={styles.container}>
      <View>
        {/* <ThemedText style={styles.date}>Lumina Smart {dateString}</ThemedText> */}
        <ThemedText style={styles.date}>Lumina Smart</ThemedText>
        <ThemedText type="title" style={styles.greeting}>{greeting}</ThemedText>
      </View>

      <Pressable onPress={() => setShowHumidity(!showHumidity)}>
        <GlassView 
          intensity={40} 
          style={styles.weatherPill}
          tint={showHumidity ? 'light' : 'dark'}
        >
          <Animated.View style={[styles.pillContent, frontStyle]}>
            <IconSymbol name="cloud.sun.fill" size={16} color="#FFD54F" />
            <ThemedText style={styles.weatherText}>24°C</ThemedText>
          </Animated.View>
          
          {/* <Animated.View style={[styles.pillContent, backStyle]}>
            <IconSymbol name="drop.fill" size={16} color="#7CCFFF" />
            <ThemedText style={styles.weatherText}>65%</ThemedText>
          </Animated.View> */}
        </GlassView>
      </Pressable>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  date: {
    fontSize: 12,
    lineHeight: 12,
    opacity: 0.6,
    letterSpacing: 1,
  },
  greeting: {
    fontSize: 20,
    lineHeight: 20,
    marginTop: 4,
  },
  weatherPill: {
    width: 84,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ECEDEE',
  },
});
