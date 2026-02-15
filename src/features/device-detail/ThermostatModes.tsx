import { haptics } from '@/src/utils/haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ModeButton } from './ModeButton';

export const THERMOSTAT_MODES = [
  { key: 'heat', icon: 'local_fire_department', label: 'Heat' },
  { key: 'cool', icon: 'ac_unit', label: 'Cool' },
  { key: 'auto', icon: 'autorenew', label: 'Auto' },
  { key: 'eco', icon: 'eco', label: 'Eco' },
] as const;

export interface ThermostatModesProps {
  activeMode: string;
  onModeChange: (key: string) => void;
}

export const ThermostatModes: React.FC<ThermostatModesProps> = ({
  activeMode,
  onModeChange,
}) => (
  <View style={styles.row}>
    {THERMOSTAT_MODES.map((m) => (
      <ModeButton
        key={m.key}
        icon={m.icon}
        label={m.label}
        isActive={activeMode === m.key}
        onPress={() => {
          haptics.tap();
          onModeChange(m.key);
        }}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
