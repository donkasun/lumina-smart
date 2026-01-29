import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectionStore } from '../../store/useConnectionStore';
import { Toast } from './Toast';

/**
 * Place once at the root layout, above all other content.
 * Renders up to 3 stacked toasts anchored to the top of the screen.
 */
export const ToastContainer: React.FC = () => {
  const insets = useSafeAreaInsets();
  const toasts = useConnectionStore((s) => s.toasts);
  const removeToast = useConnectionStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.container, { top: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});
