import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, Circle, Shadow } from '@shopify/react-native-skia';

interface CategoryItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
}

const CategoryItem = ({ icon, label, isActive }: CategoryItemProps) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');
  const shadowLight = useThemeColor({}, 'shadowLight');
  const activeColor = "#007AFF";
  const inactiveColor = "#9BA1A6";

  return (
    <Pressable style={styles.itemContainer}>
      <View style={styles.iconWrapper}>
        <Canvas style={styles.canvas}>
          <Circle cx={32} cy={32} r={28} color={surfaceColor}>
            {!isActive && (
              <>
                <Shadow dx={4} dy={4} blur={8} color={shadowDark} />
                <Shadow dx={-4} dy={-4} blur={8} color={shadowLight} />
              </>
            )}
            {isActive && (
              <Shadow dx={0} dy={0} blur={10} color="rgba(0, 122, 255, 0.2)" />
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
    paddingHorizontal: 20,
    gap: 20,
    paddingVertical: 10,
  },
  itemContainer: {
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    zIndex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
