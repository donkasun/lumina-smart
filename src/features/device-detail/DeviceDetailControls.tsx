import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Defs, Path, RadialGradient, Stop, Svg, LinearGradient as SvgGradient } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Shadows } from '@/constants/shadows';
import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AnimatedToggle } from '@/src/components/controls/AnimatedToggle';
import { LockControls } from '@/src/components/controls/LockControls';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { Device, useDeviceStore } from '@/src/store/useDeviceStore';
import { Ionicons } from '@expo/vector-icons';

import { haptics } from '@/src/utils/haptics';
import { BrightnessSlider } from './BrightnessSlider';
import { ColourPalette } from './ColourPalette';
import { ColourTemperatureBar } from './ColourTemperatureBar';
import { CameraEvent, EventRow } from './EventRow';
import { ScheduleList } from './ScheduleList';
import { ThermostatDial } from './ThermostatDial';

const PRIMARY = '#FF7D54';
const GLOW_SIZE = 140;
const BULB_ICON_SIZE = 80;
const GLOW_OFF_COLOR = '#E2E8F0';

function isLightColor(hex: string): boolean {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return false;
  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.7;
}

interface DeviceDetailControlsProps {
  device: Device;
}

// ─────────────────────────────────────────────────────────────
// BULB DETAIL
// ─────────────────────────────────────────────────────────────
const LightDetail: React.FC<{ device: Device }> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);
  const updateDeviceValue = useDeviceStore((s) => s.updateDeviceValue);
  const updateDeviceColor = useDeviceStore((s) => s.updateDeviceColor);

  // Pulsing glow animation
  const glowOpacity = useSharedValue(0.15);
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.30, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [glowOpacity]);

  // Glow color and intensity from device (color + brightness); fixed radius, opacity varies
  const glowBaseAlpha = useSharedValue(0.2);
  React.useEffect(() => {
    if (device.isOn) {
      glowBaseAlpha.value = 0.3 + (device.value / 100) * 0.45;
    } else {
      glowBaseAlpha.value = 0.6;
    }
    // Intentionally omit shared values from deps; we sync device state into them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.isOn, device.color, device.value]);

  // Animate overall glow opacity (brightness + pulse); gradient shape is static
  const glowContainerStyle = useAnimatedStyle(() => ({
    opacity: glowBaseAlpha.value * glowOpacity.value,
  }));

  const handlePowerPress = useCallback(() => {
    haptics.tap();
    toggleDevice(device.id);
  }, [device.id, toggleDevice]);

  const handleBrightnessChange = useCallback(
    (v: number) => updateDeviceValue(device.id, v),
    [device.id, updateDeviceValue]
  );

  const handleColorChange = useCallback(
    (color: string) => updateDeviceColor(device.id, color),
    [device.id, updateDeviceColor]
  );

  const glowColor = device.isOn ? (device.color ?? PRIMARY) : GLOW_OFF_COLOR;
  const powerButtonBg = device.isOn ? (device.color ?? PRIMARY) : '#E2E8F0';
  const powerIconColor = device.isOn
    ? isLightColor(device.color ?? PRIMARY)
      ? '#000000'
      : '#FFFFFF'
    : '#94A3B8';

  return (
    <View style={styles.section}>
      {/* Hero Zone */}
      <View style={styles.heroZone}>
        <View style={styles.heroControlsRow}>
          {/* Bulb with glow centered behind it */}
          <View style={styles.bulbGlowWrapper}>
            <Animated.View style={[styles.glowBlobSvg, glowContainerStyle]}>
              <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
                <Defs>
                  <RadialGradient id="bulbGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <Stop offset="0" stopColor={glowColor} stopOpacity={1} />
                    <Stop offset="1" stopColor={glowColor} stopOpacity={0.6} />
                  </RadialGradient>
                </Defs>
                <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#bulbGlow)" />
              </Svg>
            </Animated.View>
            <View style={styles.bulbIconWrapper}>
              <IconSymbol name="lightbulb.fill" size={BULB_ICON_SIZE} color={device.isOn ? (device.color ?? PRIMARY) : '#CBD5E1'} />
            </View>
          </View>

          <View style={styles.powerControlGroup}>
            <Pressable onPress={handlePowerPress}>
              <View
                style={[
                  styles.powerButton,
                  { backgroundColor: powerButtonBg },
                ]}
              >
                <Ionicons
                  name="power"
                  size={24}
                  color={powerIconColor}
                />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Brightness Slider */}
      <BrightnessSlider value={device.value} onChange={handleBrightnessChange} />

      {/* Colour Temperature Bar */}
      <ColourTemperatureBar />

      {/* Colour Palette */}
      <ColourPalette selectedColor={device.color} onColorChange={handleColorChange} />

      {/* Schedule List */}
      <ScheduleList />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// MODE BUTTON
// ─────────────────────────────────────────────────────────────
interface ModeButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, label, isActive, onPress }) => {
  const subtextColor = useThemeColor({}, 'icon');
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 120 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View style={[styles.modeButtonWrapper, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.modeButton,
          isActive
            ? { backgroundColor: PRIMARY, ...(Shadows.primaryUnderglow as object) }
            : { backgroundColor: 'rgba(255,255,255,0.6)' },
        ]}
      >
        <IconSymbol
          name={icon as any}
          size={20}
          color={isActive ? '#FFFFFF' : subtextColor}
        />
        <Text
          style={[
            styles.modeButtonLabel,
            { color: isActive ? '#FFFFFF' : subtextColor },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────
// THERMOSTAT DETAIL
// ─────────────────────────────────────────────────────────────
const FAN_LABELS = ['Auto', 'Low', 'Med', 'High'];

const ThermostatDetail: React.FC<{ device: Device }> = ({ device }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const updateDeviceValue = useDeviceStore((s) => s.updateDeviceValue);

  const [activeMode, setActiveMode] = React.useState<string>('heat');
  const [fanIndex, setFanIndex] = React.useState(2); // Med

  const handleTempChange = useCallback(
    (v: number) => updateDeviceValue(device.id, v),
    [device.id, updateDeviceValue]
  );

  const MODES = [
    { key: 'heat', icon: 'local_fire_department', label: 'Heat' },
    { key: 'cool', icon: 'ac_unit', label: 'Cool' },
    { key: 'auto', icon: 'autorenew', label: 'Auto' },
    { key: 'eco', icon: 'eco', label: 'Eco' },
  ];

  return (
    <View style={styles.section}>
      {/* Thermostat Dial */}
      <ThermostatDial value={device.value} onChange={handleTempChange} />

      {/* Mode Buttons */}
      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <ModeButton
            key={m.key}
            icon={m.icon}
            label={m.label}
            isActive={activeMode === m.key}
            onPress={() => {
              haptics.tap();
              setActiveMode(m.key);
            }}
          />
        ))}
      </View>

      {/* Fan Speed Slider */}
      <GlassCard style={styles.fanCard}>
        <View style={styles.fanHeader}>
          <View style={styles.fanHeaderLeft}>
            <IconSymbol name="mode_fan" size={18} color={PRIMARY} />
            <Text style={[styles.sectionLabel, { color: subtextColor }]}>FAN SPEED</Text>
          </View>
          <View style={styles.fanBadge}>
            <Text style={styles.fanBadgeText}>{FAN_LABELS[fanIndex]}</Text>
          </View>
        </View>

        <FanSpeedSlider value={fanIndex} onChange={setFanIndex} />

        <View style={styles.fanLabels}>
          {FAN_LABELS.map((l) => (
            <Text key={l} style={[styles.fanLabel, { color: subtextColor }]}>
              {l}
            </Text>
          ))}
        </View>
      </GlassCard>

      {/* Info Row */}
      <View style={styles.infoRow}>
        {/* Humidity */}
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoIconCircle}>
            <IconSymbol name="humidity_mid" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.infoValue, { color: textColor }]}>45%</Text>
          <Text style={[styles.infoLabel, { color: subtextColor }]}>Humidity</Text>
        </GlassCard>

        {/* Next Schedule */}
        <GlassCard style={styles.infoCard}>
          <View style={styles.scheduleIconBg}>
            <IconSymbol name="calendar_today" size={36} color={PRIMARY} />
          </View>
          <Text style={[styles.infoValue, { color: textColor }]}>20:30</Text>
          <Text style={[styles.scheduleTemp, { color: PRIMARY }]}>20°C</Text>
        </GlassCard>
      </View>
    </View>
  );
};

// Discrete fan speed slider (snap to 4 positions)
const FanSpeedSlider: React.FC<{ value: number; onChange: (i: number) => void }> = ({
  value,
  onChange,
}) => {
  const trackWidth = useSharedValue(0);
  const thumbX = useSharedValue(0);

  const segmentCount = FAN_LABELS.length - 1; // 3 segments

  const indexToX = (i: number, w: number) => (i / segmentCount) * (w - 24);

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      const w = e.nativeEvent.layout.width;
      trackWidth.value = w;
      thumbX.value = indexToX(value, w);
    },
    [value, trackWidth, thumbX]
  );

  const updateIndex = useCallback(
    (i: number) => onChange(i),
    [onChange]
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const maxX = trackWidth.value - 24;
      const raw = Math.max(0, Math.min(e.x - 12, maxX));
      thumbX.value = raw;
    })
    .onEnd(() => {
      const maxX = trackWidth.value - 24;
      const ratio = thumbX.value / maxX;
      const nearestIndex = Math.round(ratio * segmentCount);
      thumbX.value = withSpring(indexToX(nearestIndex, trackWidth.value), { damping: 15 });
      runOnJS(updateIndex)(nearestIndex);
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value + 12,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  return (
    <View style={styles.fanTrackContainer} onLayout={onLayout}>
      <View style={[styles.fanTrack, { backgroundColor: 'rgba(226,232,240,0.8)' }]} />
      <Animated.View style={[styles.fanTrackFill, { backgroundColor: PRIMARY }, fillStyle]} />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.fanThumbWrapper, thumbStyle]}>
          <View style={[styles.fanThumb, { borderColor: PRIMARY }, Shadows.card as object]} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// CAMERA DETAIL
// ─────────────────────────────────────────────────────────────
const MOCK_EVENTS: CameraEvent[] = [
  { type: 'Motion Detected', time: '2 minutes ago', thumbnail: null },
  { type: 'Person Detected', time: '14 minutes ago', thumbnail: null },
  { type: 'Vehicle Detected', time: '1 hour ago', thumbnail: null },
];

const CameraDetail: React.FC<{ device: Device }> = ({ device }) => {
  const subtextColor = useThemeColor({}, 'icon');

  const recOpacity = useSharedValue(1);
  React.useEffect(() => {
    recOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [recOpacity]);

  const recDotStyle = useAnimatedStyle(() => ({
    opacity: recOpacity.value,
  }));

  const ACTION_BUTTONS = [
    { icon: 'mic', label: 'Talk', bg: PRIMARY, iconColor: '#FFF', labelColor: '#FFF', shadow: Shadows.primaryUnderglow },
    { icon: 'photo_camera', label: 'Snapshot', bg: '#F3F4F6', iconColor: '#374151', labelColor: '#374151', shadow: {} },
    { icon: 'video.fill', label: 'Record', bg: '#F3F4F6', iconColor: '#374151', labelColor: '#374151', shadow: {} },
    { icon: 'notification_important', label: 'Alarm', bg: 'rgba(239,68,68,0.10)', iconColor: '#EF4444', labelColor: '#EF4444', border: '#EF4444', shadow: {} },
  ];

  return (
    <View style={styles.section}>
      {/* Live Feed Hero */}
      <View style={styles.feedHeroWrapper}>
        {device.image ? (
          <ImageBackground
            source={device.image}
            style={styles.feedHero}
            imageStyle={styles.feedHeroImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.50)', 'transparent', 'rgba(0,0,0,0.30)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Badges */}
            <View style={styles.feedBadgeRow}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <View style={styles.recBadge}>
                <Animated.View style={[styles.recDot, recDotStyle]} />
                <Text style={styles.recBadgeText}>REC</Text>
              </View>
            </View>

            {/* HD badge top-right */}
            <View style={styles.hdBadge}>
              <Text style={styles.hdText}>HD 1080p</Text>
            </View>

            {/* Corner scan brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </ImageBackground>
        ) : (
          <View style={[styles.feedHero, styles.feedHeroFallback]}>
            <IconSymbol name="video.fill" size={48} color="#64748B" />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <GlassCard style={styles.actionCard}>
        <View style={styles.actionRow}>
          {ACTION_BUTTONS.map((btn) => (
            <ActionButton key={btn.label} {...btn} />
          ))}
        </View>
      </GlassCard>

      {/* Event List */}
      <View style={styles.eventsSection}>
        <Text style={[styles.eventsTitle, { color: subtextColor }]}>RECENT EVENTS</Text>
        <FlatList
          data={MOCK_EVENTS}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item, index }) => (
            <EventRow
              event={item}
              style={index === MOCK_EVENTS.length - 1 ? { opacity: 0.7 } : undefined}
            />
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

interface ActionButtonProps {
  icon: string;
  label: string;
  bg: string;
  iconColor: string;
  labelColor: string;
  border?: string;
  shadow?: object;
  onPress?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, bg, iconColor, labelColor, border, shadow, onPress }) => {
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => scale.value = withTiming(0.95, { duration: 120 });
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15 }); };
  const handlePress = () => {
    haptics.press();
    onPress?.();
  };

  return (
    <Animated.View style={[styles.actionButtonWrapper, anim]}>
      <Pressable onPress={handlePress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.actionButtonPressable}>
        <View
          style={[
            styles.actionCircle,
            { backgroundColor: bg },
            border ? { borderWidth: 1, borderColor: border } : {},
            shadow as object,
          ]}
        >
          <IconSymbol name={icon as any} size={24} color={iconColor} />
        </View>
        <Text style={[styles.actionLabel, { color: labelColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────
// SOLAR DETAIL
// ─────────────────────────────────────────────────────────────
const SOLAR_DATA = [80, 75, 40, 20, 50, 70];
const SOLAR_X_LABELS = ['06:00', '10:00', '14:00', '18:00', '22:00'];

const SolarDetail: React.FC<{ device: Device }> = ({ device }) => {
  const textColor = useThemeColor({}, 'text');
  const subtextColor = useThemeColor({}, 'icon');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border' as any) ?? 'rgba(0,0,0,0.08)';

  // Pulsing glow
  const glowOpacity = useSharedValue(0.20);
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withTiming(0.50, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const recOpacity = useSharedValue(1);
  React.useEffect(() => {
    recOpacity.value = withRepeat(
      withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [recOpacity]);
  const recDotStyle = useAnimatedStyle(() => ({ opacity: recOpacity.value }));

  // SVG chart path
  const { linePath, areaPath } = useMemo(() => {
    const w = 100;
    const h = 100;
    const pts = SOLAR_DATA.map((v, i) => ({
      x: (i / (SOLAR_DATA.length - 1)) * w,
      y: h - (v / 100) * h,
    }));

    const makeQCurve = (points: { x: number; y: number }[]) => {
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const cx = (points[i - 1].x + points[i].x) / 2;
        const cy = (points[i - 1].y + points[i].y) / 2;
        d += ` Q ${points[i - 1].x} ${points[i - 1].y} ${cx} ${cy}`;
      }
      d += ` Q ${points[points.length - 2].x} ${points[points.length - 2].y} ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
      return d;
    };

    const curve = makeQCurve(pts);
    const area = `${curve} L ${w} ${h} L 0 ${h} Z`;
    return { linePath: curve, areaPath: area };
  }, []);

  return (
    <View style={styles.section}>
      {/* Production Hero */}
      <GlassCard style={styles.solarHeroCard}>
        {/* LIVE badge */}
        <View style={styles.solarLiveBadge}>
          <Animated.View style={[styles.solarLiveDot, recDotStyle]} />
          <Text style={styles.solarLiveText}>LIVE</Text>
        </View>

        {/* Icon circle with glow */}
        <View style={styles.solarIconWrapper}>
          <Animated.View style={[styles.solarGlow, glowStyle]} />
          <View style={styles.solarIconCircle}>
            <IconSymbol name="solar_power" size={60} color={PRIMARY} />
          </View>
        </View>

        <Text style={[styles.solarHeroLabel, { color: subtextColor }]}>Real-time Production</Text>
        <View style={styles.solarValueRow}>
          <Text style={[styles.solarValue, { color: textColor }]}>{device.value}</Text>
          <Text style={[styles.solarUnit, { color: PRIMARY }]}>W</Text>
        </View>

        <View style={styles.solarMetricsRow}>
          <Text style={[styles.solarMetric, { color: subtextColor }]}>Efficiency 94%</Text>
          <View style={styles.solarDivider} />
          <Text style={[styles.solarMetric, { color: subtextColor }]}>Peak Today 1.8 kW</Text>
        </View>
      </GlassCard>

      {/* Production History Chart */}
      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionLabel, { color: subtextColor }]}>PRODUCTION HISTORY</Text>
          <View style={styles.chartTabs}>
            <View style={[styles.chartTab, styles.chartTabActive]}>
              <Text style={styles.chartTabActiveText}>Today</Text>
            </View>
            <Pressable>
              <View style={styles.chartTab}>
                <Text style={[styles.chartTabText, { color: subtextColor }]}>Week</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Svg viewBox="0 0 100 100" width="100%" height={160}>
          <Defs>
            <SvgGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={PRIMARY} stopOpacity="0.20" />
              <Stop offset="1" stopColor={PRIMARY} stopOpacity="0" />
            </SvgGradient>
          </Defs>
          <Path d={areaPath} fill="url(#solarGrad)" />
          <Path d={linePath} stroke={PRIMARY} strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>

        <View style={styles.xLabels}>
          {SOLAR_X_LABELS.map((l) => (
            <Text key={l} style={[styles.xLabel, { color: subtextColor }]}>
              {l}
            </Text>
          ))}
        </View>
      </GlassCard>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(251,146,60,0.15)' }]}>
            <IconSymbol name="bolt.fill" size={20} color="#F97316" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>12.4 kWh</Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Today</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
            <IconSymbol name="house.fill" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>8.2 kWh</Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Usage</Text>
        </GlassCard>

        <GlassCard style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
            <IconSymbol name="grid_goldenratio" size={20} color="#22C55E" />
          </View>
          <Text style={[styles.statValue, { color: textColor }]}>4.2 kWh</Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Grid</Text>
        </GlassCard>
      </View>

      {/* System Health */}
      <View
        style={[
          styles.healthCard,
          { backgroundColor: surfaceColor, borderColor: borderColor as string },
        ]}
      >
        <View style={styles.healthLeft}>
          <View style={styles.healthIconCircle}>
            <IconSymbol name="verified" size={22} color="#22C55E" />
          </View>
          <View style={styles.healthText}>
            <Text style={[styles.healthTitle, { color: textColor }]}>System Health</Text>
            <Text style={[styles.healthSubtitle, { color: subtextColor }]}>
              All 12 panels online
            </Text>
          </View>
        </View>
        <View style={styles.optimalBadge}>
          <View style={styles.optimalDot} />
          <Text style={styles.optimalText}>OPTIMAL</Text>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN SWITCH
// ─────────────────────────────────────────────────────────────
export const DeviceDetailControls: React.FC<DeviceDetailControlsProps> = ({ device }) => {
  const toggleDevice = useDeviceStore((s) => s.toggleDevice);

  switch (device.type) {
    case 'light':
      return <LightDetail device={device} />;

    case 'thermostat':
      return <ThermostatDetail device={device} />;

    case 'camera':
      return <CameraDetail device={device} />;

    case 'lock':
      return (
        <View style={styles.section}>
          <GlassCard>
            <LockControls
              isLocked={device.isOn}
              onToggle={(_locked) => toggleDevice(device.id)}
            />
          </GlassCard>
        </View>
      );

    case 'ac':
      return (
        <View style={styles.section}>
          <GlassCard style={{ gap: 16 }}>
            <Text style={styles.acLabel}>Air Conditioning</Text>
            <AnimatedToggle value={device.isOn} onChange={(_v) => toggleDevice(device.id)} label="Power" />
          </GlassCard>
        </View>
      );

    case 'solar':
      return <SolarDetail device={device} />;

    default:
      return null;
  }
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  section: {
    gap: 8,
    paddingTop: 8,
    paddingHorizontal: 16,
  },

  // ── Light hero ──
  heroZone: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  heroControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulbGlowWrapper: {
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlobSvg: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    left: 0,
    top: 0,
  },
  bulbIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerControlGroup: {
    position: 'absolute',
    left: GLOW_SIZE / 2 + 40,
  },
  powerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerStateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  powerStateButton: {
    minWidth: 72,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerStateButtonActive: {
    backgroundColor: PRIMARY,
  },
  powerStateButtonInactive: {
    backgroundColor: '#E2E8F0',
  },
  powerStateText: {
    fontSize: 13,
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  powerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  powerLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },

  // ── Mode buttons ──
  modeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButtonWrapper: {
    flex: 1,
  },
  modeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
  },
  modeButtonLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Fan card ──
  fanCard: {
    gap: 12,
  },
  fanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fanHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fanBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  fanBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  fanTrackContainer: {
    height: 24,
    justifyContent: 'center',
  },
  fanTrack: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fanTrackFill: {
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    left: 0,
  },
  fanThumbWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fanThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  fanLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fanLabel: {
    fontSize: 10,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Info row ──
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: Typography.regular,
  },
  scheduleIconBg: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.05,
  },
  scheduleTemp: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },

  // ── Camera feed ──
  feedHeroWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    ...(Shadows.section as object),
  },
  feedHero: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  feedHeroImage: {
    borderRadius: 20,
  },
  feedHeroFallback: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    top: 12,
    left: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  recBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  hdBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.40)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hdText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  // Corner scan brackets
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },

  // ── Action buttons ──
  actionCard: {
    padding: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButtonWrapper: {
    alignItems: 'center',
  },
  actionButtonPressable: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Typography.semiBold,
  },

  // ── Events ──
  eventsSection: {
    gap: 8,
  },
  eventsTitle: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Solar hero ──
  solarHeroCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    borderColor: 'rgba(255,125,84,0.10)',
    borderWidth: 1,
  },
  solarLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  solarLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  solarLiveText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  solarIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  solarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,125,84,0.25)',
  },
  solarIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,125,84,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solarHeroLabel: {
    fontSize: 14,
    fontFamily: Typography.regular,
  },
  solarValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  solarValue: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  solarUnit: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Typography.bold,
    paddingBottom: 8,
  },
  solarMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  solarMetric: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  solarDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // ── Chart ──
  chartCard: {
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  chartTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartTabActive: {
    backgroundColor: PRIMARY,
  },
  chartTabActiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  chartTabText: {
    fontSize: 11,
    fontFamily: Typography.regular,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    fontSize: 9,
    fontFamily: Typography.regular,
    textTransform: 'uppercase',
    opacity: 0.5,
  },

  // ── Stats grid ──
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Typography.regular,
  },

  // ── Health card ──
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  healthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  healthIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthText: {
    gap: 2,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },
  healthSubtitle: {
    fontSize: 12,
    fontFamily: Typography.regular,
  },
  optimalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  optimalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  optimalText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
  },

  // ── AC / misc ──
  acLabel: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.bold,
    color: '#64748B',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
