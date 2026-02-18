// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
// Allow both SF Symbol names and our custom Material Icon aliases
type IconSymbolName = keyof typeof MAPPING | string;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'square.grid.2x2.fill': 'grid-view',
  'chart.line.uptrend.xyaxis': 'show-chart',
  'bolt.fill': 'bolt',
  'sparkles': 'auto-awesome',
  'gearshape.fill': 'settings',
  'cloud.sun.fill': 'wb-sunny',
  'drop.fill': 'opacity',
  'moon.fill': 'nights-stay',
  'car.fill': 'directions-car',
  'briefcase.fill': 'work',
  'tv.fill': 'tv',
  'video.fill': 'videocam',
  'plus': 'add',
  'lightbulb.fill': 'lightbulb',
  'thermometer.medium': 'thermostat',
  'lock.fill': 'lock',
  'lock.open.fill': 'lock-open',
  'wind': 'air',
  'slider.horizontal.3': 'tune',
  'chevron.left': 'chevron-left',
  'music.note': 'music-note',
  'arrowtriangle.backward.fill': 'skip-previous',
  'pause.circle.fill': 'pause-circle',
  'play.circle.fill': 'play-circle',
  'arrowtriangle.forward.fill': 'skip-next',
  'power_settings_new': 'power',
  'light_mode': 'light-mode',
  'local_fire_department': 'local-fire-department',
  'ac_unit': 'ac-unit',
  'autorenew': 'autorenew',
  'eco': 'eco',
  'mode_fan': 'air',
  'humidity_mid': 'water-drop',
  'schedule': 'schedule',
  'mic': 'mic',
  'photo_camera': 'photo-camera',
  'notification_important': 'notification-important',
  'verified': 'verified',
  'solar_power': 'solar-power',
  'grid_goldenratio': 'grid-view',
  'calendar_today': 'calendar-today',
  'palette': 'palette',
  'wb_twilight': 'wb-twilight',
  'dark_mode': 'dark-mode',
  'arrow_back_ios_new': 'arrow-back-ios',
  'more_vert': 'more-vert',
  'location.fill': 'location-on',
  'battery.75percent': 'battery-charging-full',
  'brush.fill': 'brush',
  'cleaning.services': 'cleaning-services',
  'air.purifier.fill': 'air',
  'wand.and.stars': 'auto-awesome',
  'scope': 'gps-fixed',
  'line.diagonal': 'border-outer',
  'square.grid.2x2': 'grid-view',
  'wifi': 'wifi',
  'sensor.fill': 'sensors',
  'bell.fill': 'notifications',
  'minus.circle.fill': 'do-not-disturb-alt',
  'video.slash.fill': 'videocam-off',
  'speaker.wave.2.fill': 'volume-up',
  'person.fill': 'person',
  'info': 'info',
  'info.outline': 'info-outline',
  'auto_mode': 'autorenew',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={(MAPPING as any)[name]} style={style} />;
}
