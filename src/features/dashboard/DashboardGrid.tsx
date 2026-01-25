import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DeviceCard } from './DeviceCard';
import { useDeviceStore } from '../../store/useDeviceStore';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cardWrapper: {
    marginBottom: 0,
  },
});

export const DashboardGrid: React.FC = () => {
  const { devices, toggleDevice } = useDeviceStore();

  return (
    <View style={styles.grid}>
      {devices.map((device, index) => (
        <Animated.View
          key={device.id}
          entering={FadeInDown.delay(index * 100).springify().damping(15)}
          style={styles.cardWrapper}
        >
          <DeviceCard 
            device={device} 
            onPress={() => toggleDevice(device.id)} 
          />
        </Animated.View>
      ))}
    </View>
  );
};