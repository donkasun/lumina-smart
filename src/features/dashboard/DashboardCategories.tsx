import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, Circle, Shadow } from '@shopify/react-native-skia';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  interpolateColor,
  useDerivedValue,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Scenario, useDeviceStore } from '../../store/useDeviceStore';

interface CategoryItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

const CategoryItem = ({ icon, label, isActive, onPress }: CategoryItemProps) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');
  const shadowLight = useThemeColor({}, 'shadowLight');
  const activeColor = useThemeColor({}, 'accent');
  const inactiveColor = useThemeColor({}, 'icon');

  // Animation value: 0 = Inactive (Raised), 1 = Active (Pressed)
  const transition = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    transition.value = withSpring(isActive ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [isActive]);

  // Interpolate only inner shadows
  const innerShadowDarkColor = useDerivedValue(() => {
    return interpolateColor(transition.value, [0, 1], ['transparent', `${activeColor}54`]);
  });
  const innerShadowLightColor = useDerivedValue(() => {
    return interpolateColor(transition.value, [0, 1], ['transparent', shadowLight]);
  });

  return (
    <Pressable style={styles.itemContainer} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Canvas style={styles.canvas}>
          <Circle cx={28} cy={28} r={26} color={surfaceColor}>
            {/* Outer Shadows (Always visible) */}
            <Shadow dx={2} dy={2} blur={3} color={shadowDark} />
            <Shadow dx={-2} dy={-2} blur={3} color={shadowLight} />

            {/* Inner Shadows (Pressed/Active state transition) */}
            <Shadow dx={2} dy={2} blur={3} color={innerShadowDarkColor} inner />
            <Shadow dx={-2} dy={-2} blur={3} color={innerShadowLightColor} inner />
          </Circle>
        </Canvas>
        <View style={styles.icon}>
          <IconSymbol
            name={icon as any}
            size={24}
            color={isActive ? activeColor : inactiveColor}
          />
        </View>
      </View>
      <ThemedText style={[
        styles.label,
        { color: isActive ? activeColor : inactiveColor }
      ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
};

export const DashboardCategories = () => {
  const [activeCategory, setActiveCategory] = useState<Scenario>('Morning');
  const setScenario = useDeviceStore(state => state.setScenario);

  const categories: { id: Scenario; label: string; icon: string }[] = [
    { id: 'Morning', label: 'Morning', icon: 'cloud.sun.fill' },
    { id: 'Away', label: 'Away', icon: 'car.fill' },
    { id: 'Work', label: 'Work', icon: 'briefcase.fill' },
    { id: 'Movie', label: 'Movie', icon: 'tv.fill' },
    { id: 'Sleep', label: 'Sleep', icon: 'moon.fill' },
  ];

  const handlePress = (id: Scenario) => {
    setActiveCategory(id);
    setScenario(id);
  };

  return (
    <View style={styles.scrollWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
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
    height: 90,
  },
  container: {
    gap: 12,
    alignItems: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    zIndex: 1,
  },
  label: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
});