import { Stack } from 'expo-router';

export default function DeviceLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'default',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
