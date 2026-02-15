import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { haptics } from '@/src/utils/haptics';
import React, { memo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Scenario, useDeviceStore } from '../../store/useDeviceStore';

interface CategoryItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

const CategoryItem = memo(({ icon, label, isActive, onPress }: CategoryItemProps) => {
  const accentColor = useThemeColor({}, 'accent');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const subtextColor = useThemeColor({}, 'subtext');

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.92, { duration: 100 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      runOnJS(haptics.tap)();
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.itemContainer, animatedStyle]}>
        {isActive ? (
          <View style={[styles.circle, { backgroundColor: accentColor }, Shadows.heroUnderglow]}>
            <IconSymbol name={icon as any} size={28} color="#FFFFFF" />
          </View>
        ) : (
          <View style={[styles.circle, { backgroundColor: surfaceColor, borderWidth: 1, borderColor }, Shadows.card]}>
            <IconSymbol name={icon as any} size={28} color={iconColor} />
          </View>
        )}
        <Text style={[
          styles.label,
          isActive
            ? { color: accentColor, fontFamily: Typography.bold }
            : { color: subtextColor, fontFamily: Typography.medium },
        ]}>
          {label}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
});

CategoryItem.displayName = 'CategoryItem';

export const DashboardCategories = () => {
  const [activeCategory, setActiveCategory] = useState<Scenario>('Morning');
  const setScenario = useDeviceStore(state => state.setScenario);

  const categories: { id: Scenario; label: string; icon: string }[] = [
    { id: 'Morning', label: 'Morning', icon: 'cloud.sun.fill' },
    { id: 'Away',    label: 'Away',    icon: 'car.fill' },
    { id: 'Work',    label: 'Work',    icon: 'briefcase.fill' },
    { id: 'Movie',   label: 'Movie',   icon: 'tv.fill' },
    { id: 'Sleep',   label: 'Sleep',   icon: 'moon.fill' },
  ];

  const handlePress = (id: Scenario) => {
    setActiveCategory(id);
    setScenario(id);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scrollWrapper}
      >
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            isActive={activeCategory === cat.id}
            onPress={() => handlePress(cat.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollWrapper: {
    padding: 16,
  },
  container: {
    gap: 16,
    paddingRight: 16,
  },
  itemContainer: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
  },
});
