import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Circle, G, Rect, Svg, Text as SvgText } from 'react-native-svg';
import { PRIMARY } from './constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const VB_W = 340;
const VB_H = 200;
const SVG_HEIGHT = 220;

const ROOMS = [
  { key: 'living', label: 'Living Room', x: 10, y: 10, w: 180, h: 100 },
  { key: 'kitchen', label: 'Kitchen', x: 200, y: 10, w: 130, h: 80 },
  { key: 'bedroom', label: 'Bedroom', x: 10, y: 120, w: 150, h: 70 },
  { key: 'bathroom', label: 'Bathroom', x: 170, y: 120, w: 80, h: 70 },
  // { key: 'hallway', label: 'Hallway', x: 145, y: 100, w: 40, h: 30 },
] as const;

export type RoomKey = (typeof ROOMS)[number]['key'];

const WAYPOINTS = [
  { cx: 30, cy: 30 },
  { cx: 170, cy: 30 },
  { cx: 170, cy: 50 },
  { cx: 30, cy: 50 },
  { cx: 30, cy: 70 },
  { cx: 170, cy: 70 },
  { cx: 170, cy: 90 },
  { cx: 30, cy: 90 },
];

// Dock at bottom of Living Room so path to first waypoint stays in the same room
const DOCK_CX = 30;
const DOCK_CY = 95;

const SEGMENT_DURATION = 7000;
/** Duration for slow return-to-dock when pausing */
const RETURN_TO_DOCK_DURATION_MS = 2800;

interface FloorMapProps {
  isOn: boolean;
  selectedRoom: RoomKey | null;
  onRoomSelect: (room: RoomKey | null) => void;
  /** When true, robot animates to dock and onDockReached is called when it arrives */
  returnToDock?: boolean;
  onDockReached?: () => void;
}

export const FloorMap: React.FC<FloorMapProps> = ({
  isOn,
  selectedRoom,
  onRoomSelect,
  returnToDock = false,
  onDockReached,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const scale = screenWidth / VB_W;
  const isDark = useColorScheme() === 'dark';

  const robotCx = useSharedValue(DOCK_CX);
  const robotCy = useSharedValue(DOCK_CY);

  useEffect(() => {
    if (returnToDock && onDockReached) {
      robotCx.value = withTiming(
        DOCK_CX,
        { duration: RETURN_TO_DOCK_DURATION_MS },
        (finished) => {
          'worklet';
          if (finished) runOnJS(onDockReached)();
        }
      );
      robotCy.value = withTiming(DOCK_CY, { duration: RETURN_TO_DOCK_DURATION_MS });
    } else if (isOn) {
      const cxTimings = WAYPOINTS.map((wp) => withTiming(wp.cx, { duration: SEGMENT_DURATION }));
      const cyTimings = WAYPOINTS.map((wp) => withTiming(wp.cy, { duration: SEGMENT_DURATION }));
      robotCx.value = withRepeat(withSequence(...cxTimings), -1, false);
      robotCy.value = withRepeat(withSequence(...cyTimings), -1, false);
    } else {
      robotCx.value = withTiming(DOCK_CX, { duration: 800 });
      robotCy.value = withTiming(DOCK_CY, { duration: 800 });
    }
  }, [isOn, returnToDock, onDockReached, robotCx, robotCy]);

  const animatedRobotProps = useAnimatedProps(() => ({
    cx: robotCx.value,
    cy: robotCy.value,
  }));

  const roomFill = (key: RoomKey) =>
    selectedRoom === key
      ? 'rgba(255,125,84,0.25)'
      : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(200,210,220,0.30)';

  const roomStroke = (key: RoomKey) =>
    selectedRoom === key
      ? PRIMARY
      : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(150,160,170,0.50)';

  const labelFill = isDark ? 'rgba(200,210,220,0.75)' : 'rgba(100,116,139,0.9)';

  const handleRoomPress = (key: RoomKey) => {
    onRoomSelect(selectedRoom === key ? null : key);
  };

  return (
    <View style={styles.container}>
      <Svg width="100%" height={SVG_HEIGHT} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        {ROOMS.map((room) => (
          <G key={room.key}>
            <Rect
              x={room.x}
              y={room.y}
              width={room.w}
              height={room.h}
              rx={8}
              fill={roomFill(room.key)}
              stroke={roomStroke(room.key)}
              strokeWidth={1.5}
            />
            <SvgText
              x={room.x + room.w / 2}
              y={room.y + room.h / 2 + 4}
              fontSize={10}
              fill={labelFill}
              textAnchor="middle"
              fontWeight="600"
            >
              {room.label}
            </SvgText>
          </G>
        ))}

        <AnimatedCircle
          animatedProps={animatedRobotProps}
          r={8}
          fill={PRIMARY}
          opacity={0.95}
        />
        <AnimatedCircle
          animatedProps={animatedRobotProps}
          r={3}
          fill="#FFFFFF"
          opacity={0.9}
        />
      </Svg>

      {ROOMS.map((room) => (
        <Pressable
          key={room.key}
          style={[
            styles.roomOverlay,
            {
              left: room.x * scale,
              top: room.y * (SVG_HEIGHT / VB_H),
              width: room.w * scale,
              height: room.h * (SVG_HEIGHT / VB_H),
            },
          ]}
          onPress={() => handleRoomPress(room.key)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: SVG_HEIGHT,
  },
  roomOverlay: {
    position: 'absolute',
  },
});
