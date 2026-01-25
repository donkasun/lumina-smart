refer to the following code and update the @GlassButton.tsx to accpet children

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
Canvas,
RoundedRect,
Shadow,
Fill,
vec,
} from '@shopify/react-native-skia';

/\*\*

- REUSABLE COMPONENT: SkiaShadowButton
-
- Uses Skia to draw a "Neumorphic" background with double shadows
- (one dark, one light) to create the 3D popped-out effect.
  _/
  const SkiaShadowButton = ({
  children,
  width = 160,
  height = 160,
  borderRadius = 30,
  onPress
  }) => {
  // We need extra canvas space for the shadows so they don't get clipped.
  const shadowPadding = 20;
  const canvasWidth = width + shadowPadding _ 2;
  const canvasHeight = height + shadowPadding \* 2;

// Colors based on a light-grey theme
const BASE_COLOR = "#F0F2F5";
const SHADOW_DARK = "#D1D9E6";
const SHADOW_LIGHT = "#FFFFFF";

return (
<Pressable
onPress={onPress}
style={({ pressed }) => [
styles.buttonContainer,
{ width, height },
// Optional: reduce opacity slightly when pressed to give feedback
pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] }
]} >
{/_ 1. The Skia Background Layer _/}
<View style={[styles.canvasWrapper, { width: canvasWidth, height: canvasHeight, top: -shadowPadding, left: -shadowPadding }]}>
<Canvas style={{ flex: 1 }}>
{/_ We draw the Rounded Rectangle with two shadows _/}
<RoundedRect
            x={shadowPadding}
            y={shadowPadding}
            width={width}
            height={height}
            r={borderRadius}
            color={BASE_COLOR}
          >
{/_ Bottom-Right Shadow (Darker) _/}
<Shadow dx={10} dy={10} blur={15} color={SHADOW_DARK} />
{/_ Top-Left Highlight (White) _/}
<Shadow dx={-6} dy={-6} blur={15} color={SHADOW_LIGHT} />
</RoundedRect>
</Canvas>
</View>

      {/* 2. The Content Layer (passed via props) */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </Pressable>

);
};

/\*\*

- USAGE EXAMPLE: The "COOL" Button
  _/
  const App = () => {
  return (
  <View style={styles.screen}>
  <SkiaShadowButton onPress={() => console.log('Cool pressed!')}>
  {/_ We can pass any React Native components here \*/}
          {/* Simulating the Snowflake Icon with text for simplicity */}
          {/* You could replace this with <Icon name="snowflake" /> from vector-icons */}
          <Text style={styles.icon}>❄️</Text>

          <Text style={styles.label}>COOL</Text>
        </SkiaShadowButton>
      </View>
  );
  };

const styles = StyleSheet.create({
screen: {
flex: 1,
backgroundColor: '#F0F2F5', // Background must match button color for Neumorphism
justifyContent: 'center',
alignItems: 'center',
},
buttonContainer: {
// This container holds the layout space
position: 'relative',
justifyContent: 'center',
alignItems: 'center',
},
canvasWrapper: {
// Positions the canvas absolutely behind the content
position: 'absolute',
// We explicitly don't set overflow: hidden so shadows can bleed out
},
contentContainer: {
// Ensures content sits on top of the canvas
zIndex: 1,
alignItems: 'center',
justifyContent: 'center',
},
icon: {
fontSize: 50,
marginBottom: 10,
color: '#333',
// Fix for emoji vertical alignment
includeFontPadding: false,
},
label: {
fontSize: 20,
fontWeight: '800', // Heavy bold to match image
color: '#1A1A1A',
letterSpacing: 0.5,
}
});

export default App;
