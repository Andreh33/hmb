// EMBER vector art — SVG path data for the ingredient leader lines and the
// location route. Hand-authored so the "draw-on" (stroke-dashoffset) animation
// reads as deliberate cartography, not generic. All in a 0..100 viewBox space.

/** A gentle hand-drawn route used in the Location act (drawn as you scroll). */
export const ROUTE_PATH =
  "M6 78 C 22 70, 26 52, 40 50 S 64 60, 70 44 S 60 22, 78 18 S 94 26, 94 12";

/** Concentric ember rings for the ingredient stage backdrop. */
export const STAGE_RINGS = [22, 34, 46];

/**
 * Build an elbow leader line from the stage centre toward a label anchor.
 * angleDeg measured from +x, reach is 0..1 of the stage radius.
 */
export function leaderLine(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
  reach: number,
): { d: string; tipX: number; tipY: number; side: "left" | "right" } {
  const rad = (angleDeg * Math.PI) / 180;
  const startR = radius * 0.42;
  const sx = cx + Math.cos(rad) * startR;
  const sy = cy + Math.sin(rad) * startR;
  const endR = radius * reach;
  const ex = cx + Math.cos(rad) * endR;
  const ey = cy + Math.sin(rad) * endR;
  const side: "left" | "right" = ex < cx ? "left" : "right";
  const elbowX = ex + (side === "left" ? -radius * 0.18 : radius * 0.18);
  return {
    d: `M ${sx.toFixed(2)} ${sy.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)} L ${elbowX.toFixed(2)} ${ey.toFixed(2)}`,
    tipX: elbowX,
    tipY: ey,
    side,
  };
}
