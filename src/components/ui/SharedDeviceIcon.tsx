import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DeviceType } from '@/src/store/useDeviceStore';

interface SharedDeviceIconProps {
  deviceId: string;
  deviceType: DeviceType;
  isOn: boolean;
  size?: number;
  accentColor: string;
  surfaceColor: string;
  iconColor: string;
  customColor?: string;
  /** Custom icon (e.g. SVG component from require('*.svg')) - used for vacuum, purifier, doorbell, sprinkler, solar */
  customIcon?: any;
}

export const SharedDeviceIcon: React.FC<SharedDeviceIconProps> = ({
  deviceId,
  deviceType,
  isOn,
  size = 50,
  accentColor,
  surfaceColor,
  iconColor,
  customColor,
  customIcon,
}) => {
  const getIconName = (type: DeviceType, lockState: boolean) => {
    switch (type) {
      case 'light':
        return 'lightbulb.fill';
      case 'thermostat':
        return 'thermometer.medium';
      case 'lock':
        return lockState ? 'lock.fill' : 'lock.open.fill';
      case 'camera':
        return 'video.fill';
      case 'ac':
        return 'wind';
      default:
        return 'square.grid.2x2.fill';
    }
  };

  const backgroundColor = customColor || (isOn ? accentColor : surfaceColor);
  const borderRadius = size * 0.32;

  const shadowStyle = Platform.select({
    ios: isOn
      ? {
          shadowColor: backgroundColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.38,
          shadowRadius: 6,
        }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
        },
    android: { elevation: isOn ? 6 : 2 },
  });

  const iconSize = size * 0.48;
  const ResolvedCustom = customIcon?.default ?? customIcon;
  const useCustomIcon = typeof ResolvedCustom === 'function';

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size, borderRadius, backgroundColor },
        shadowStyle,
      ]}
    >
      <View style={styles.iconContainer}>
        {useCustomIcon ? (
          <ResolvedCustom width={iconSize} height={iconSize} color={iconColor} />
        ) : (
          <IconSymbol
            name={getIconName(deviceType, isOn) as any}
            size={iconSize}
            color={iconColor}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
