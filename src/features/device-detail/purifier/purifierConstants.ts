import { createArcPath } from './arcUtils';

export const PURIFIER_SPEEDS = ['auto', 'low', 'mid', 'high'] as const;
export type PurifierSpeed = (typeof PURIFIER_SPEEDS)[number];

export const PURIFIER_SPEED_LABELS: Record<PurifierSpeed, string> = {
  auto: 'Auto',
  low: 'Low',
  mid: 'Mid',
  high: 'High',
};

/** Filter status ring (arc) geometry. */
export const RING_CX = 60;
export const RING_CY = 60;
export const RING_R = 50;
export const RING_START_ANGLE = 140;
export const RING_SWEEP_TOTAL = 280;
export const FILTER_LIFE_PCT = 0.72;

export const RING_TRACK_PATH = createArcPath(
  RING_CX,
  RING_CY,
  RING_R,
  RING_START_ANGLE,
  RING_SWEEP_TOTAL
);
export const RING_FILL_PATH = createArcPath(
  RING_CX,
  RING_CY,
  RING_R,
  RING_START_ANGLE,
  FILTER_LIFE_PCT * RING_SWEEP_TOTAL
);

export const DEFAULT_PURIFIER_ICON = require('../../../../assets/icons/air_purifier.svg');

/** Normalize device mode string to PurifierSpeed ('medium' -> 'mid'). */
export function normalizePurifierSpeed(mode: string | undefined): PurifierSpeed {
  if (mode === 'medium') return 'mid';
  if (
    mode === 'auto' ||
    mode === 'low' ||
    mode === 'mid' ||
    mode === 'high'
  ) {
    return mode;
  }
  return 'auto';
}
