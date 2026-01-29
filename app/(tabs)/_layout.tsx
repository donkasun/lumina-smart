import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Colors, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const TAB_BAR_HEIGHT = 50;
const TAB_ICON_SIZE = 20;
const CENTER_BUTTON_SIZE = 56;
const CENTER_GAP = 74;

type TabMeta = {
  label: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
};

const TAB_META: Record<string, TabMeta> = {
  index: { label: 'Hub', icon: 'square.grid.2x2.fill' },
  usage: { label: 'Usage', icon: 'chart.line.uptrend.xyaxis' },
  flows: { label: 'Flows', icon: 'sparkles' },
  settings: { label: 'Settings', icon: 'gearshape.fill' },
};

function CenterPlusButton({ onPress }: { onPress: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fabBg = isDark ? '#FFFFFF' : '#000000';
  const fabIcon = isDark ? '#000000' : '#FFFFFF';

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={onPress}
      style={styles.centerPressable}
    >
      <Animated.View
        style={[
          styles.centerButton,
          animatedStyle,
          { backgroundColor: fabBg },
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
            },
            android: { elevation: 10 },
          }),
        ]}
      >
        <IconSymbol name="plus" size={28} color={fabIcon} />
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
  activeColor,
  inactiveColor,
  surfaceColor,
  borderColor,
  tabBarBottom,
  onCenterPress,
}: BottomTabBarProps & {
  activeColor: string;
  inactiveColor: string;
  surfaceColor: string;
  borderColor: string;
  tabBarBottom: number;
  onCenterPress: () => void;
}) {
  const renderTabItem = (routeName: string) => {
    const routeIndex = state.routes.findIndex((route) => route.name === routeName);
    if (routeIndex === -1) return null;

    const route = state.routes[routeIndex];
    const isFocused = state.index === routeIndex;
    const meta = TAB_META[routeName];
    const color = isFocused ? activeColor : inactiveColor;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabItem}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
        testID={descriptors[route.key].options.tabBarButtonTestID}
      >
        <IconSymbol size={TAB_ICON_SIZE} name={meta.icon} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{meta.label}</Text>
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={[styles.tabRoot, { bottom: tabBarBottom }]}>
      <View
        style={[
          styles.tabPill,
          {
            height: TAB_BAR_HEIGHT,
            backgroundColor: surfaceColor,
            borderColor,
          },
          Shadows.section,
        ]}
      >
        <View style={styles.sideGroup}>
          {renderTabItem('index')}
          {renderTabItem('usage')}
        </View>
        <View style={{ width: CENTER_GAP }} />
        <View style={styles.sideGroup}>
          {renderTabItem('flows')}
          {renderTabItem('settings')}
        </View>
      </View>
      <CenterPlusButton onPress={onCenterPress} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const [isAddDeviceOpen, setIsAddDeviceOpen] = React.useState(false);

  const activeColor = useThemeColor({}, 'accent');
  const inactiveColor = Colors[theme].icon;
  const surfaceColor = Colors[theme].surface;
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'subtext');
  const tabBarBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 24);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
          tabBarStyle: { display: 'none' },
        }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            surfaceColor={surfaceColor}
            borderColor={borderColor}
            tabBarBottom={tabBarBottom}
            onCenterPress={() => setIsAddDeviceOpen(true)}
          />
        )}
      >
        <Tabs.Screen name="index" options={{ title: 'Hub' }} />
        <Tabs.Screen name="usage" options={{ title: 'Usage' }} />
        <Tabs.Screen name="flows" options={{ title: 'Flows' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>

      <Modal
        visible={isAddDeviceOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddDeviceOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAddDeviceOpen(false)}>
          <Pressable
            onPress={() => undefined}
            style={[
              styles.bottomSheet,
              {
                backgroundColor: surfaceColor,
                borderColor,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: textColor }]}>Add New Device</Text>
            <Text style={[styles.sheetSubtitle, { color: subtextColor }]}>Bottom sheet placeholder. Device setup flow will be added next.</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabRoot: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  tabPill: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    minWidth: 62,
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontFamily: Typography.bold,
    fontSize: 10,
    lineHeight: 12,
  },
  centerPressable: {
    position: 'absolute',
    top: -(CENTER_BUTTON_SIZE - TAB_BAR_HEIGHT) / 2,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 220,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(127,127,127,0.5)',
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: Typography.bold,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontFamily: Typography.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
