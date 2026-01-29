import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TRACK = { title: 'Midnight Dreams', artist: 'Luna Waves' };

interface ControlButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  size?: number;
  onPress?: () => void;
}

const ControlButton: React.FC<ControlButtonProps> = ({ icon, color, size = 24, onPress }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={animStyle}>
        <IconSymbol name={icon} size={size} color={color} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const MusicPlayerCard: React.FC = memo(() => {
  const [isPlaying, setIsPlaying] = useState(true);
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const accentColor = useThemeColor({}, 'accent');

  return (
    <GlassCard style={styles.card}>
      <LinearGradient
        colors={['rgba(124,58,237,0.08)', 'rgba(59,130,246,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.row}>
        <View style={styles.albumArt}>
          <IconSymbol name="music.note" size={24} color="#7C3AED" />
        </View>

        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, { color: textColor }]} numberOfLines={1}>
            {TRACK.title}
          </Text>
          <Text style={[styles.artist, { color: subtextColor }]} numberOfLines={1}>
            {TRACK.artist}
          </Text>
        </View>

        <View style={styles.controls}>
          <ControlButton icon="skip.backward.fill" color={iconColor} />
          <ControlButton
            icon={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
            color={accentColor}
            size={32}
            onPress={() => setIsPlaying((p) => !p)}
          />
          <ControlButton icon="skip.forward.fill" color={iconColor} />
        </View>
      </View>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: Typography.bold,
  },
  artist: {
    fontSize: 12,
    fontFamily: Typography.medium,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
