import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/** Map Material-style icon names (used in app) to SF Symbol names for iOS. */
const IOS_SYMBOL_MAP: Partial<Record<string, SymbolViewProps['name']>> = {
  'local_fire_department': 'flame.fill',
  'ac_unit': 'snowflake',
  'autorenew': 'arrow.triangle.2.circlepath',
  'auto_mode': 'arrow.triangle.2.circlepath',
  'eco': 'leaf.fill',
  'mode_fan': 'fanblades.fill',
  'humidity_mid': 'humidity',
  'calendar_today': 'calendar',
  'grid_goldenratio': 'square.grid.2x2',
  'account_balance_wallet': 'creditcard.fill',
  'power_settings_new': 'power',
  'verified': 'checkmark.shield.fill',
  'check': 'checkmark',
  'photo_camera': 'camera.fill',
  'notification_important': 'bell.badge.fill',
  'mic': 'mic.fill',
  'video.fill': 'video.fill',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const resolvedName = (IOS_SYMBOL_MAP[name as string] ?? name) as SymbolViewProps['name'];
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={resolvedName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
