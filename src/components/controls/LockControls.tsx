import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedToggle } from './AnimatedToggle';

interface LockControlsProps {
  isLocked: boolean;
  onToggle: (locked: boolean) => void;
}

export const LockControls: React.FC<LockControlsProps> = ({ isLocked, onToggle }) => {
  return (
    <View style={styles.container}>
      <AnimatedToggle
        value={isLocked}
        onChange={onToggle}
        label={isLocked ? 'Locked' : 'Unlocked'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
