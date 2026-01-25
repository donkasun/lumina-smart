import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassView } from '@/src/components/ui/GlassView';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { formatHeaderDate, getTimeBasedGreeting } from '../../utils/date';

export const DashboardHeader: React.FC = () => {
  const [showHumidity, setShowHumidity] = useState(false);

  const rotation = useDerivedValue(() => {
    return withSpring(showHumidity ? 180 : 0, { damping: 15, mass: 0.8 });
  }, [showHumidity]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${rotation.value - 180}deg` }],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  }));

  const dateString = formatHeaderDate();
  const greeting = getTimeBasedGreeting('Kasun');


  // const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
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
            <ThemedText style={[styles.weatherText, { color: textColor }]}>24°C</ThemedText>
          </Animated.View>
          
          <Animated.View style={[styles.pillContent, backStyle]}>
            <IconSymbol name="drop.fill" size={16} color="#7CCFFF" />
            <ThemedText style={styles.weatherText}>65%</ThemedText>
          </Animated.View>
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
    // backgroundColor:'white'
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
    // color: '#ECEDEE',
  },
});
