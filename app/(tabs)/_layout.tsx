import { Canvas, Circle, RoundedRect, Shadow } from '@shopify/react-native-skia';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, LayoutChangeEvent, Platform, Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Simple Tab Button
 */
const SimpleTabButton = ({ children, onPress, onLongPress }: any) => {
  return (
    <Pressable 
      onPress={onPress} 
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      {children}
    </Pressable>
  );
};

/**
 * Custom Tab Bar Button for the Center Action
 */
const CenterActionButton = ({ onPress }: { onPress?: () => void }) => {
  const accentColor = "#007AFF"; 
  
  return (
    <View style={styles.centerButtonContainer}>
      <Pressable onPress={onPress}>
        <View style={styles.centerButtonShadowWrapper}>
          <Canvas style={styles.centerButtonCanvas}>
            <Circle cx={32} cy={32} r={28} color={accentColor}>
              <Shadow dx={0} dy={4} blur={8} color="rgba(0, 122, 255, 0.4)" />
            </Circle>
          </Canvas>
          <View style={styles.centerButtonIcon}>
            <IconSymbol name="bolt.fill" size={32} color="white" />
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const TabBarBackground = ({ surfaceColor, shadowDark, shadowLight }: any) => {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    console.log('event.nativeEvent.layout.width', event.nativeEvent.layout.width);
    const tabWidth = Dimensions.get('window').width -32;
    console.log('tabWidth', tabWidth);
    setWidth(tabWidth);
  };

  return (
    <View style={styles.backgroundContainer} onLayout={onLayout}>
      <Canvas style={{ flex: 1, }}>
        {width > 0 && (
          <RoundedRect
            x={16}
            y={2}
            width={width}
            height={60}
            r={40}
            color={surfaceColor}
          >
            {/* Same shadow params as GlassButton for consistency */}
            <Shadow dx={4} dy={4} blur={3} color={shadowDark} />
            <Shadow dx={-4} dy={-4} blur={3} color={shadowLight} />
          </RoundedRect>
        )}
      </Canvas>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const activeColor = "#007AFF"; 
  const inactiveColor = Colors[theme].icon;
  const surfaceColor = Colors[theme].surface;
  const shadowDark = Colors[theme].shadowDark;
  const shadowLight = Colors[theme].shadowLight;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        // tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          // backgroundColor: 'red',
          elevation: 0,
          bottom: Platform.OS === 'ios' ? 34 : 24,
          left: 16,
          right: 16,
          height: 68,
        },
        tabBarBackground: () => (
          <TabBarBackground 
            surfaceColor={surfaceColor} 
            shadowDark={shadowDark} 
            shadowLight={shadowLight} 
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hub',
          tabBarButton: (props) => <SimpleTabButton {...props} />,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="usage"
        options={{
          title: 'Usage',
          tabBarButton: (props) => <SimpleTabButton {...props} />,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />,
        }}
      />
      <Tabs.Screen
        name="action"
        options={{
          title: '',
          tabBarButton: () => <CenterActionButton onPress={() => console.log('Action Pressed')} />,
        }}
      />
      <Tabs.Screen
        name="flows"
        options={{
          title: 'Flows',
          tabBarButton: (props) => <SimpleTabButton {...props} />,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarButton: (props) => <SimpleTabButton {...props} />,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    margin: -20,
    padding: 20,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: 60,
    paddingHorizontal: 16,
  },
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonShadowWrapper: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20, 
  },
  centerButtonCanvas: {
    width: 64,
    height: 64,
    position: 'absolute',
  },
  centerButtonIcon: {
    zIndex: 1,
  },
});
