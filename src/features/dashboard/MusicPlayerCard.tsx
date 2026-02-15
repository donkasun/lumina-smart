import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const TRACKS = [
  {
    file: require('../../../assets/audio/Call me crazy - Patrick Patrikios.mp3'),
    filename: 'Call me crazy - Patrick Patrikios.mp3',
  },
  {
    file: require('../../../assets/audio/F16 - The Grey Room _ Golden Palms.mp3'),
    filename: 'F16 - The Grey Room _ Golden Palms.mp3',
  },
  {
    file: require('../../../assets/audio/Intergalactic - Alex Jones _ Xander Jones.mp3'),
    filename: 'Intergalactic - Alex Jones _ Xander Jones.mp3',
  },
];

const parseTrackInfo = (filename: string) => {
  const [title, artist] = filename.replace('.mp3', '').split(' - ');
  return { title, artist };
};

interface ControlButtonProps {
  icon?: any;
  color?: string;
  size?: number;
  onPress?: () => void;
  children?: React.ReactNode;
}

const ControlButton: React.FC<ControlButtonProps> = ({ icon, color, size = 24, onPress, children }) => {
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
        {children ?? <IconSymbol name={icon} size={size} color={color!} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const MusicPlayerCard: React.FC = memo(function MusicPlayerCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');

  const currentTrack = TRACKS[currentTrackIndex];
  const { title, artist } = parseTrackInfo(currentTrack.filename);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(true);
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
      }
    }
  };

  const loadAndPlayTrack = async (index: number, shouldPlay: boolean) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        TRACKS[index].file,
        { shouldPlay },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    } catch (error) {
      console.error('Error loading track:', error);
    }
  };

  useEffect(() => {
    loadAndPlayTrack(currentTrackIndex, isPlaying);
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-run on track change
  }, [currentTrackIndex]);

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const handleNext = () => {
    setIsPlaying(true);
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handleBack = async () => {
    if (position > 3000) {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
      }
    } else {
      setIsPlaying(true);
      setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    }
  };

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
            {title}
          </Text>
          <Text style={[styles.artist, { color: subtextColor }]} numberOfLines={1}>
            {artist}
          </Text>
        </View>

        <View style={styles.controls}>
          <ControlButton onPress={handleBack}>
            <Ionicons name="play-skip-back" size={18} color={textColor} />
          </ControlButton>
          <ControlButton
            icon={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
            color={textColor}
            size={32}
            onPress={handlePlayPause}
          />
          <ControlButton onPress={handleNext}>
            <Ionicons name="play-skip-forward" size={18} color={textColor} />
          </ControlButton>
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
