import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, Circle, Shadow } from '@shopify/react-native-skia';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface CategoryItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
}

const CategoryItem = ({ icon, label, isActive }: CategoryItemProps) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');
  const shadowLight = useThemeColor({}, 'shadowLight');
  const activeColor = useThemeColor({}, 'accent');
  const inactiveColor = useThemeColor({}, 'icon');

  return (
    <Pressable style={styles.itemContainer}>
      <View style={styles.iconWrapper}>
        <Canvas style={styles.canvas}>
          <Circle cx={24} cy={24} r={22} color={surfaceColor}>
            <Shadow dx={2} dy={2} blur={3} color={shadowDark} />
            <Shadow dx={-2} dy={-2} blur={3} color={shadowLight} />
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <CategoryItem icon="cloud.sun.fill" label="Morning" isActive />
      <CategoryItem icon="house.fill" label="Away" />
      <CategoryItem icon="paperplane.fill" label="Movie" />
      <CategoryItem icon="moon.fill" label="Sleep" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 12,
  },
  itemContainer: {
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 50,
    height: 50,
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
