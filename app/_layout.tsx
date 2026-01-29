import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BackgroundBlobs } from '@/src/components/background/BackgroundBlobs';
import { CustomSplash } from '@/src/components/CustomSplash';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashComplete, setSplashComplete] = useState(false);
  const [loaded, error] = useFonts({
    'PlusJakartaSans-Light':    PlusJakartaSans_300Light,
    'PlusJakartaSans-Regular':  PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium':   PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold':     PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      // Hide native splash screen
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  const theme = colorScheme ?? 'light';
  const screenBackground = Colors[theme].background;

  // Use transparent theme backgrounds so BackgroundBlobs show through (Stack/Tabs often use theme.colors.background)
  const navTheme = colorScheme === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent', card: 'transparent' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'transparent', card: 'transparent' } };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <View style={{ flex: 1, backgroundColor: screenBackground }} onLayout={onLayoutRootView}>
          <BackgroundBlobs />
          {/* Full-screen blurred transparent layer so every screen has a frosted background */}
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={95}
              tint={theme === 'dark' ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
              pointerEvents="none"
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.03)' }]}
              pointerEvents="none"
            />
          )}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="device" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>

          {!splashComplete && (
            <CustomSplash onAnimationComplete={() => setSplashComplete(true)} />
          )}

          <StatusBar style={splashComplete ? "auto" : "light"} />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
