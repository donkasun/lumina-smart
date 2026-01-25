import { useThemeColor } from '@/hooks/use-theme-color';
import {
    Canvas,
    RoundedRect,
    Shadow,
} from '@shopify/react-native-skia';
import React from 'react';
import { Pressable, StyleSheet, View, ViewProps } from 'react-native';
import {
    interpolateColor,
    useDerivedValue,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface GlassButtonProps extends ViewProps {
  onPress?: () => void;
  width?: number;
  height?: number;
  borderRadius?: number;
  children?: React.ReactNode;
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasWrapper: {
    position: 'absolute',
  },
  contentContainer: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * REUSABLE COMPONENT: GlassButton (Neumorphic)
 * 
 * Uses Skia to draw a "Neumorphic" background with double shadows.
 * - Outer shadows provide depth when unpressed.
 * - Inner shadows appear when pressed to create a recessed effect.
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  width = 160,
  height = 160,
  borderRadius = 30,
  onPress,
  style,
  ...props
}) => {
  const shadowPadding = 20;
  const canvasWidth = width + shadowPadding * 2;
  const canvasHeight = height + shadowPadding * 2;

  // Theme colors
  const baseColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');
  const shadowLight = useThemeColor({}, 'shadowLight');

  // Animation state for press
  const pressed = useSharedValue(0); // 0 = unpressed, 1 = pressed

  // Derived shadow colors (fade in on press)
  const innerShadowDark = useDerivedValue(() => {
    return interpolateColor(pressed.value, [0, 1], ['transparent', shadowDark]);
  });

  const innerShadowLight = useDerivedValue(() => {
    return interpolateColor(pressed.value, [0, 1], ['transparent', shadowLight]);
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (pressed.value = withSpring(1, { damping: 20, stiffness: 500 }))}
      onPressOut={() => (pressed.value = withSpring(0, { damping: 20, stiffness: 500 }))}
      style={({ pressed: isPressed }) => [
        styles.buttonContainer,
        { width, height },
        style,
      ]}
      {...props}
    >
      {/* Skia Background Layer */}
      <View style={[styles.canvasWrapper, { width: canvasWidth, height: canvasHeight, top: -shadowPadding, left: -shadowPadding }]}>
        <Canvas style={{ flex: 1 }}>
          <RoundedRect
            x={shadowPadding}
            y={shadowPadding}
            width={width}
            height={height}
            r={borderRadius}
            color={baseColor}
          >
            {/* Outer shadows (depth) */}
            <Shadow dx={10} dy={10} blur={3} color={shadowDark} />
            <Shadow dx={-6} dy={-6} blur={3} color={shadowLight} />
            
            {/* Inner shadows (recessed effect on press) */}
            <Shadow dx={4} dy={4} blur={3} color={innerShadowDark} inner />
            <Shadow dx={-4} dy={-4} blur={3} color={innerShadowLight} inner />
          </RoundedRect>
        </Canvas>
      </View>

      {/* Content Layer */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </Pressable>
  );
};