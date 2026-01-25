import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDeviceStore } from '../../store/useDeviceStore';
import { DeviceCard } from './DeviceCard';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginLeft: -6,
    paddingRight: 6,
    // paddingTop: 20,
  },
  cardWrapper: {
    marginBottom: 24,
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