import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDeviceStore } from '../../store/useDeviceStore';
import { DeviceCard } from './DeviceCard';

export const DashboardGrid: React.FC = () => {
  const { devices, toggleDevice } = useDeviceStore();

  // Split devices into two columns for masonry effect
  const leftColumn = devices.filter((_, index) => index % 2 === 0);
  const rightColumn = devices.filter((_, index) => index % 2 !== 0);

  const renderColumn = (columnDevices: typeof devices) => (
    <View style={styles.column}>
      {columnDevices.map((device) => (
        <View key={device.id} style={styles.cardWrapper}>
          <DeviceCard 
            device={device} 
            onPress={() => toggleDevice(device.id)} 
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.gridContainer}>
      {renderColumn(leftColumn)}
      {renderColumn(rightColumn)}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    // backgroundColor: 'blue',
    // align items to start/end to ensure the gap in the middle is consistent
  },
  cardWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    // backgroundColor: 'green',
  },
});