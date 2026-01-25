import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Device } from '../../store/useDeviceStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 16) / 2;
const CARD_WRAPPER_WIDTH = CARD_WIDTH + 12;

const BUTTON_WIDTH = 44;
const BUTTON_WRAPPER_WIDTH = BUTTON_WIDTH + 12;

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
  const accentColor = useThemeColor({}, 'accent');
  const activeTextColor = useThemeColor({}, 'activeText');
  const inactiveIconColor = useThemeColor({}, 'icon');
  const mainTextColor = useThemeColor({}, 'text');

  // Animation for the icon circle state
  const transition = useSharedValue(device.isOn ? 1 : 0);

  useEffect(() => {
    transition.value = withSpring(device.isOn ? 1 : 0, { damping: 20, stiffness: 300 });
  }, [device.isOn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.cardWrapper}>
        <Canvas style={styles.cardCanvas}>
          <RoundedRect
            x={6}
            y={6}
            width={CARD_WIDTH}
            height={CARD_WIDTH}
            r={16}
            color={surfaceColor}
          >
            <Shadow dx={4} dy={4} blur={3} color={shadowDark} />
            <Shadow dx={-4} dy={-4} blur={3} color={shadowLight} />
          </RoundedRect>
        </Canvas>
      </View>

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Canvas style={styles.iconCanvas}>
              <RoundedRect x={10} y={10} width={36} height={36} r={8} color={device.isOn ? accentColor : surfaceColor}>
                {!device.isOn ? (
                  <>
                    <Shadow dx={4} dy={4} blur={3} color={shadowDark} />
                    <Shadow dx={-4} dy={-4} blur={3} color={shadowLight} />
                  </>
                ):(
                  <Shadow dx={0} dy={2} blur={6} color={`${accentColor}90`} />
                )}
              </RoundedRect>
            </Canvas>
            <IconSymbol
              name={getIconName(device.type) as any}
              size={24}
              color={device.isOn ? 'white' : inactiveIconColor}
              style={{ marginLeft: -12, marginTop: -12 }}
            />
          </View>
          {device.isOn && (
            <View style={[styles.activeIndicator, { backgroundColor: accentColor }]} />
          )}
        </View>

        <View style={styles.footer}>
          <ThemedText style={[styles.name, { color: mainTextColor }]}>{device.name}</ThemedText>
          <ThemedText style={[styles.status, { color: device.isOn ? activeTextColor : inactiveIconColor }]}>
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
  },
  cardWrapper: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_WRAPPER_WIDTH,
    height: CARD_WRAPPER_WIDTH,
  },
  cardCanvas: {
    ...StyleSheet.absoluteFillObject,
    width: CARD_WRAPPER_WIDTH,
    height: CARD_WRAPPER_WIDTH,
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
    width: CARD_WRAPPER_WIDTH - 40,
  },
  iconWrapper: {
    width: BUTTON_WIDTH,
    height: BUTTON_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCanvas: {
    ...StyleSheet.absoluteFillObject,
    width: BUTTON_WRAPPER_WIDTH,
    height: BUTTON_WRAPPER_WIDTH,
    marginLeft: -12,
    marginTop: -12,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  footer: {
    gap: 2,
    // backgroundColor: 'red',
    width: CARD_WRAPPER_WIDTH - 40,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
