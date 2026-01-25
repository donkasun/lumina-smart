import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDeviceStore } from '../../store/useDeviceStore';
import { DeviceCard } from './DeviceCard';

export const DashboardGrid: React.FC = () => {
  const { devices, toggleDevice } = useDeviceStore();

  return (
    <View style={styles.grid}>
      {devices.map((device, index) => (
        <View
          key={device.id}
          style={styles.cardWrapper}
        >
          <DeviceCard 
            device={device} 
            onPress={() => toggleDevice(device.id)} 
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  cardWrapper: {
    marginBottom: 8,
  },
});
