import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewProps } from 'react-native';

interface NeomorphButtonProps extends ViewProps {
  onPress?: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  borderRadius?: number;
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * REUSABLE COMPONENT: NeomorphButton (Neumorphic)
 *
 * Uses native platform shadows for depth.
 * Scale 0.98 on press conveys the pressed/recessed state.
 */
export const NeomorphButton: React.FC<NeomorphButtonProps> = ({
  children,
  width = 160,
  height = 160,
  borderRadius = 30,
  onPress,
  style,
  ...props
}) => {
  const baseColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: shadowDark,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 3,
    },
    android: { elevation: 4 },
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed: isPressed }) => [
        styles.buttonContainer,
        { width, height, borderRadius, backgroundColor: baseColor },
        shadowStyle,
        style,
        { transform: [{ scale: isPressed && onPress && !props.disabled ? 0.98 : 1 }] },
      ]}
      {...props}
    >
      <View style={styles.contentContainer}>
        {children}
      </View>
    </Pressable>
  );
};
