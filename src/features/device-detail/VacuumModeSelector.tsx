import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassView } from '@/src/components/ui/GlassView';
import { haptics } from '@/src/utils/haptics';
import { PRIMARY } from './constants';

export type VacuumMode = 'auto' | 'spot' | 'edge' | 'room';

const MODES: { key: VacuumMode; label: string; icon: string }[] = [
  { key: 'auto', label: 'Auto', icon: 'wand.and.stars' },
  { key: 'spot', label: 'Spot', icon: 'scope' },
  { key: 'edge', label: 'Edge', icon: 'line.diagonal' },
  { key: 'room', label: 'Room', icon: 'square.grid.2x2' },
];

interface VacuumModeSelectorProps {
  selectedMode: VacuumMode;
  onModeChange: (mode: VacuumMode) => void;
}

const ModeCard: React.FC<{
  mode: (typeof MODES)[number];
  isSelected: boolean;
  onPress: () => void;
}> = ({ mode, isSelected, onPress }) => {
  const subtextColor = useThemeColor({}, 'icon');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable onPress={() => { haptics.tap(); onPress(); }} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.modeCard}>
      <Animated.View style={[animatedStyle, styles.modeCardInner]}>
        {isSelected ? (
          <View style={styles.cardSelected}>
            <IconSymbol name={mode.icon as any} size={24} color="#FFFFFF" />
            <Text style={styles.labelSelected}>{mode.label}</Text>
          </View>
        ) : (
          <GlassView style={styles.cardUnselected}>
            <IconSymbol name={mode.icon as any} size={24} color={subtextColor} />
            <Text style={[styles.labelUnselected, { color: subtextColor }]}>{mode.label}</Text>
          </GlassView>
        )}
      </Animated.View>
    </Pressable>
  );
};

export const VacuumModeSelector: React.FC<VacuumModeSelectorProps> = ({
  selectedMode,
  onModeChange,
}) => {
  const subtextColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionLabel, { color: subtextColor }]}>CLEANING MODE</Text>
      <View style={styles.grid}>
        {MODES.map((mode) => (
          <ModeCard
            key={mode.key}
            mode={mode}
            isSelected={mode.key === selectedMode}
            onPress={() => onModeChange(mode.key)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
  },
  modeCardInner: {
    flex: 1,
  },
  cardSelected: {
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardUnselected: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
  },
  labelSelected: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: '#FFFFFF',
  },
  labelUnselected: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
});
