import { Dimensions } from "react-native";

export const SOLAR_ORANGE = "#FF7D54";
export const GRID_GREEN = "#10B981";
export const SECONDARY_BLUE = "#3B82F6";

export const DOT_SIZE = 14;
export const GLOW_SIZE = DOT_SIZE * 1.5;
export const GLOW_MAX_SCALE = 1.3;
export const POSITIONER_SIZE = GLOW_SIZE * GLOW_MAX_SCALE;
export const TRAVEL_DURATION = 1800;
/** How long the moving thumb pauses at the center (home) before continuing to grid. */
export const PAUSE_AT_CENTER_MS = 400;
export const PULSE_DURATION = 1200;

export const FLOW_LINE_GREEN = "rgba(16,185,129,0.35)";
export const FLOW_SLOT_WIDTH = 70;

export const CHART_WIDTH = Dimensions.get("window").width - 32 - 32;

/** Solar production by hour (25 points: midnight to midnight). */
export const SOLAR_VALUES = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.15, 0.75, 2.25, 4.2, 5.85, 6.9, 7.5, 7.35, 6.45,
  4.8, 3.0, 1.2, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];

/** Usage by hour (midnight to midnight, 25 points to match SOLAR_VALUES). */
export const USAGE_VALUES = [
  1.36, 1.02, 0.85, 0.77, 1.02, 1.7, 2.98, 3.91, 4.25, 4.51, 4.68, 4.68, 4.51,
  4.42, 4.25, 4.25, 5.02, 6.12, 6.12, 5.7, 5.19, 4.25, 3.15, 2.13, 1.36,
];
