import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDeviceStore } from '@/src/store/useDeviceStore';
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

const SPEAKER_DEVICE_ID = '15';

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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const player = useAudioPlayer(TRACKS[0].file);
  const status = useAudioPlayerStatus(player);
  const setDeviceOn = useDeviceStore((s) => s.setDeviceOn);

  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');

  const isPlaying = status.playing;
  const positionMs = (status.currentTime ?? 0) * 1000;

  // Sync speaker device status with music playback
  useEffect(() => {
    setDeviceOn(SPEAKER_DEVICE_ID, isPlaying);
  }, [isPlaying, setDeviceOn]);

  // When track ends, advance to next
  useEffect(() => {
    if (status.didJustFinish) {
      const next = (currentTrackIndex + 1) % TRACKS.length;
      setCurrentTrackIndex(next);
      player.replace(TRACKS[next].file);
      player.play();
    }
  }, [status.didJustFinish]); // eslint-disable-line react-hooks/exhaustive-deps -- only react to didJustFinish

  const currentTrack = TRACKS[currentTrackIndex];
  const { title, artist } = parseTrackInfo(currentTrack.filename);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleNext = () => {
    const next = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(next);
    player.replace(TRACKS[next].file);
    player.play();
  };

  const handleBack = () => {
    if (positionMs > 3000) {
      player.seekTo(0);
    } else {
      const prev = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
      setCurrentTrackIndex(prev);
      player.replace(TRACKS[prev].file);
      player.play();
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
