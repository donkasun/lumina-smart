import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Canvas, Circle, RoundedRect, Shadow } from '@shopify/react-native-skia';
import React, { useEffect } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { NeomorphButton } from '../../components/ui/NeomorphButton';
import { Device } from '../../store/useDeviceStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32 - 16) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2; // Taller for lock button
const CARD_WRAPPER_WIDTH = CARD_WIDTH + 8;
const CARD_WRAPPER_HEIGHT = CARD_HEIGHT + 8;

const BUTTON_WIDTH = 50;
const BUTTON_WRAPPER_WIDTH = BUTTON_WIDTH + 8;

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
      case 'camera': return 'video.fill';
      case 'ac': return 'wind';
      default: return 'square.grid.2x2.fill';
    }
  };

  const isCamera = device.type === 'camera';
  const isLock = device.type === 'lock';

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
            width={CARD_WIDTH - 12}
            height={isLock ? CARD_HEIGHT - 12 : CARD_WIDTH - 12}
            r={32}
            color={surfaceColor}
          >
            <Shadow dx={4} dy={4} blur={3} color={shadowDark} />
            <Shadow dx={-4} dy={-4} blur={3} color={shadowLight} />
          </RoundedRect>
        </Canvas>
      </View>

      {/* Camera Background Image */}
      {isCamera && (
        <View style={styles.cameraImageContainer}>
          <Image 
            source={device.image}
            style={styles.cameraImage}
            resizeMode="cover"
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
        </View>
      )}

      <View style={[styles.inner, { height: isLock ? CARD_HEIGHT : CARD_WIDTH }]}>
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Canvas style={styles.iconCanvas}>
              <RoundedRect x={10} y={10} width={40} height={40} r={16} color={device.isOn ? accentColor : surfaceColor}>
                {!device.isOn ? (
                  <>
                    <Shadow dx={4} dy={4} blur={3} color={shadowDark} inner />
                    <Shadow dx={-4} dy={-4} blur={3} color={shadowLight} inner />
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
              style={{ marginLeft: -6, marginTop: -6 }}
            />
          </View>
          
          {!isCamera && (
            <View style={styles.activeIndicatorWrapper}>
              <Canvas style={styles.activeIndicatorCanvas}>
                <Circle cx={10} cy={10} r={6} color={device.isOn ? accentColor : surfaceColor}>
                  {device.isOn ? (
                    <Shadow dx={2} dy={2} blur={4} color={`${accentColor}66`} />
                  ) : (
                    <>
                      <Shadow dx={1} dy={1} blur={2} color={shadowDark} inner />
                      <Shadow dx={-1} dy={-1} blur={2} color={shadowDark} inner />
                    </>
                  )}
                </Circle>
              </Canvas>
            </View>
          )}

          {isCamera && device.isOn && (
            <View style={styles.recBadge}>
              <View style={styles.recDot} />
              <ThemedText style={styles.recText}>REC</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.footer}>
            <ThemedText style={[styles.name, { color: isCamera ? 'white' : mainTextColor }]}>{device.name}</ThemedText>
            <ThemedText style={[styles.status, { color: isCamera ? 'rgba(255,255,255,0.8)' : (device.isOn ? activeTextColor : inactiveIconColor) }]}>
              {isCamera 
                ? 'LIVE FEED' 
                : (device.type === 'lock'
                  ? (device.isOn ? 'LOCKED' : 'UNLOCKED')
                  : (device.isOn ? 'ON' : 'OFF'))
              }
              {!isCamera && device.isOn && device.value !== undefined && device.unit && ` • ${device.value}${device.unit}`}
            </ThemedText>
          </View>
          {isLock && (
            <NeomorphButton
              onPress={onPress}
              width={CARD_WIDTH - 40}
              height={32}
              borderRadius={16}
            >
              <ThemedText style={styles.lockButtonText}>
                {device.isOn ? 'UNLOCK' : 'LOCK'}
              </ThemedText>
            </NeomorphButton>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    // marginBottom: 16,
  },
  cardWrapper: {
    position: 'absolute',
    width: CARD_WRAPPER_WIDTH,
    height: CARD_WRAPPER_HEIGHT,
  },
  cardCanvas: {
    // ...StyleSheet.absoluteFillObject,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cameraImageContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: CARD_WIDTH - 12,
    height: CARD_WIDTH - 12,
    borderRadius: 32,
    overflow: 'hidden',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  inner: {
    padding: 20,
    justifyContent: 'space-between',
    // backgroundColor: 'rgba(0,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: CARD_WIDTH - 40,
    // backgroundColor: 'blue',
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
    marginLeft: -8,
    marginTop: -8,
  },
  activeIndicatorWrapper: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  activeIndicatorCanvas: {
    ...StyleSheet.absoluteFillObject,
    width: 24,
    height: 24,
  },
  recBadge: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  recText: {
    color: 'white',
    fontSize: 8,
    lineHeight: 12,
    fontWeight: '900',
  },
  content: {
    gap: 12,
    // backgroundColor: 'red',
  },
  footer: {
    gap: 2,
    width: CARD_WIDTH - 40,
  },
  name: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
  },
  status: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  lockButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7F5C',
    letterSpacing: 0.5,
  },
});