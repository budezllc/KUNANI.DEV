/** Visual knobs for the LED volume. Keep fill alpha low so HUD type stays readable. */
export const LED_RING = {
  count: 8,
  radius: 7.8,
  width: 1.85,
  height: 2.7,
  /** Radians — keeps a gap on the camera axis so no panel sits on the title. */
  angleOffset: Math.PI / 8,
  /** Interior alpha of a panel (0–1). */
  fillAlpha: 0.12,
  /** Extra alpha at the faded rim. */
  rimAlpha: 0.03,
  /** View-alignment where a panel starts counting as “in front of” the origin. */
  frontAlignStart: 0.25,
  /** View-alignment where a panel is fully between camera and origin. */
  frontAlignEnd: 0.82,
  /** World units off the camera→origin line before a panel is not “in front”. */
  frontAxisRadius: 3.2,
  /** Alpha multiplier when a panel is fully in front. */
  frontAlpha: 0.08,
} as const;

export const SPACE = {
  starCount: 1600,
  planetCount: 24,
  /** Accretion-disc radius in world units. */
  discRadius: 9.2,
  /** Event-horizon sphere. Keep small so it does not cover the hero artifact. */
  holeRadius: 0.42,
  /** UV radius of the shader hole (0–1 across the disc). */
  horizon: 0.055,
} as const;

/** 0 = off to the side, 1 = sitting on the camera→origin line. */
export function panelFrontAmount(
  panel: { x: number; y: number; z: number },
  camera: { x: number; y: number; z: number },
): number {
  const tx = panel.x - camera.x;
  const ty = panel.y - camera.y;
  const tz = panel.z - camera.z;
  const tLen = Math.hypot(tx, ty, tz) || 1;
  const cx = -camera.x;
  const cy = -camera.y;
  const cz = -camera.z;
  const cLen = Math.hypot(cx, cy, cz) || 1;
  const along = (tx / tLen) * (cx / cLen) + (ty / tLen) * (cy / cLen) + (tz / tLen) * (cz / cLen);
  const span = LED_RING.frontAlignEnd - LED_RING.frontAlignStart;
  const align = Math.min(1, Math.max(0, (along - LED_RING.frontAlignStart) / span));
  const ix = ty * cz - tz * cy;
  const iy = tz * cx - tx * cz;
  const iz = tx * cy - ty * cx;
  const perp = Math.hypot(ix, iy, iz) / cLen;
  const onAxis = 1 - Math.min(1, Math.max(0, perp / LED_RING.frontAxisRadius));
  return align * onAxis;
}
