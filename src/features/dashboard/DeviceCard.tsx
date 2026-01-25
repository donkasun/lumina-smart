import React from 'react';
import { StyleSheet, Pressable, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { Device } from '../../store/useDeviceStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Canvas, RoundedRect, Shadow, Circle } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 16) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DeviceCardProps {
  device: Device;
  onPress: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress }) => {
  const scale = useSharedValue(1);
  const surfaceColor = useThemeColor({}, 'surface');
  const shadowDark = useThemeColor({}, 'shadowDark');
  const shadowLight = useThemeColor({}, 'shadowLight');
  const accentColor = "#007AFF";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'light': return 'lightbulb.fill';
      case 'thermostat': return 'thermometer.medium';
      case 'lock': return device.isOn ? 'lock.fill' : 'lock.open.fill';
      case 'ac': return 'wind';
      default: return 'square.grid.2x2.fill';
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={StyleSheet.absoluteFill}>
        <Canvas style={{ flex: 1 }}>
          <RoundedRect
            x={0}
            y={0}
            width={CARD_WIDTH}
            height={CARD_WIDTH}
            r={32}
            color={surfaceColor}
          >
            <Shadow dx={8} dy={8} blur={15} color={shadowDark} />
            <Shadow dx={-4} dy={-4} blur={15} color={shadowLight} />
          </RoundedRect>
        </Canvas>
      </View>

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Canvas style={styles.iconCanvas}>
              <Circle cx={22} cy={22} r={22} color={surfaceColor}>
                <Shadow dx={2} dy={2} blur={4} color={shadowDark} />
                <Shadow dx={-2} dy={-2} blur={4} color={shadowLight} />
              </Circle>
            </Canvas>
            <IconSymbol 
              name={getIconName(device.type) as any} 
              size={24} 
              color={device.isOn ? accentColor : "#9BA1A6"} 
            />
          </View>
          {device.isOn && (
            <View style={[styles.activeIndicator, { backgroundColor: accentColor }]} />
          )}
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.name}>{device.name}</ThemedText>
          <ThemedText style={styles.status}>
            {device.type === 'lock' 
              ? (device.isOn ? 'LOCKED' : 'UNLOCKED') 
              : (device.isOn ? 'ON' : 'OFF')}
            {device.isOn && device.value !== undefined && device.unit && ` • ${device.value}${device.unit}`}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    marginBottom: 16,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  footer: {
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  status: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9BA1A6',
    textTransform: 'uppercase',
  },
});
