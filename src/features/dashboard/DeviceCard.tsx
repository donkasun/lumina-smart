import React from 'react';
import { StyleSheet, Pressable, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { GlassView } from '../../components/ui/GlassView';
import { ThemedText } from '@/components/themed-text';
import { Device } from '../../store/useDeviceStore';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 16) / 2;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    marginBottom: 16,
  },
  glass: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  footer: {
    gap: 4,
  },
  name: {
    fontSize: 16,
    color: '#ECEDEE',
  },
  status: {
    fontSize: 12,
    opacity: 0.6,
    color: '#9BA1A6',
  },
});

interface DeviceCardProps {
  device: Device;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
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
      <GlassView 
        intensity={device.isOn ? 60 : 30} 
        tint={device.isOn ? 'light' : 'dark'}
        style={styles.glass}
      >
        <View style={styles.header}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: device.isOn ? 'rgba(124, 207, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)' }
          ]}>
            <IconSymbol 
              name={getIconName(device.type) as any} 
              size={24} 
              color={device.isOn ? '#7CCFFF' : '#9BA1A6'} 
              weight="medium"
            />
          </View>
          <View style={[
            styles.statusDot, 
            { backgroundColor: device.isOn ? '#4CAF50' : '#757575' }
          ]} />
        </View>

        <View style={styles.footer}>
          <ThemedText type="defaultSemiBold" style={styles.name}>{device.name}</ThemedText>
          <ThemedText style={styles.status}>
            {device.type === 'lock' 
              ? (device.isOn ? 'Locked' : 'Unlocked') 
              : (device.isOn ? 'On' : 'Off')}
            {device.isOn && device.value !== undefined && device.unit && ` • ${device.value}${device.unit}`}
          </ThemedText>
        </View>
      </GlassView>
    </AnimatedPressable>
  );
};