import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, Circle, Shadow } from '@shopify/react-native-skia';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

  return (
    <Pressable style={styles.itemContainer} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Canvas style={styles.canvas}>
          <Circle cx={24} cy={24} r={22} color={surfaceColor}>
            <Shadow dx={2} dy={2} blur={3} color={shadowDark} />
            <Shadow dx={-2} dy={-2} blur={3} color={shadowLight} />
            {/* Show inner shadows only when active (pressed effect) */}
            {isActive && (
              <>
                <Shadow dx={2} dy={2} blur={3} color={`${activeColor}33`} inner />
                <Shadow dx={-2} dy={-2} blur={3} color={shadowLight} inner />
              </>
            )}
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
  const [activeCategory, setActiveCategory] = useState('Morning');

  const categories = [
    { id: 'Morning', label: 'Morning', icon: 'cloud.sun.fill' },
    { id: 'Away', label: 'Away', icon: 'house.fill' },
    { id: 'Movie', label: 'Movie', icon: 'paperplane.fill' },
    { id: 'Sleep', label: 'Sleep', icon: 'moon.fill' },
  ];

  return (
    <View>
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
            onPress={() => setActiveCategory(cat.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 10,
  },
  itemContainer: {
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
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