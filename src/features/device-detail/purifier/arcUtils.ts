/** Shared arc/polar helpers for purifier gauge and filter ring. */

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function createArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  sweepAngle: number,
  clockwise = true
): string {
  const sweep = clockwise
    ? Math.min(sweepAngle, 359.999)
    : Math.max(sweepAngle, -359.999);
  if (sweep === 0) return '';
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, startAngle + sweep);
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = clockwise ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}
