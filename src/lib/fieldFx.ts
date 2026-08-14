import { clamp, lerp } from "./math";

/** Visual knobs for the session HUD field. Does not touch playback timing. */
export const FIELD_FX = {
  cameraTravel: 140,
  spinTravel: 1080,
  sweepTravel: 720,
  idleGlow: 0.28,
  waveGlow: 0.22,
  velocityGlow: 0.55,
  idlePulse: 0.7,
  velocityPulse: 0.55,
  idleTempo: 1,
  velocityTempo: 2.4,
  velocityScale: 0.55,
  velocityDampMs: 70,
  lookDampMs: 90,
  lookEnergyScale: 2.4,
} as const;

export type FieldLook = {
  x: number;
  y: number;
};

export type FieldFx = {
  progress: number;
  velocity: number;
  lookX: number;
  lookY: number;
  cameraZ: number;
  warp: number;
  scan: number;
  spin: number;
  sweep: number;
  glow: number;
  pulse: number;
  tempo: number;
};

export type FieldFxTarget = {
  style: { setProperty: (name: string, value: string) => void };
};

/** Map page progress, scroll/pointer energy, and look onto HUD field motion. */
export function fieldFxFromScroll(
  progress: number,
  velocity = 0,
  look: FieldLook = { x: 0, y: 0 },
): FieldFx {
  const p = clamp(progress);
  const v = clamp(velocity);
  const lookX = clamp(look.x, -1, 1);
  const lookY = clamp(look.y, -1, 1);
  const wave = 0.5 + 0.5 * Math.sin(p * Math.PI * 4);
  return {
    progress: p,
    velocity: v,
    lookX,
    lookY,
    cameraZ: p * FIELD_FX.cameraTravel,
    warp: v * 0.42,
    scan: p,
    spin: p * FIELD_FX.spinTravel + lookX * 28,
    sweep: p * FIELD_FX.sweepTravel + v * 90 + lookX * 40,
    glow: clamp(FIELD_FX.idleGlow + FIELD_FX.waveGlow * wave + v * FIELD_FX.velocityGlow),
    pulse: clamp(FIELD_FX.idlePulse + v * FIELD_FX.velocityPulse),
    tempo: FIELD_FX.idleTempo + v * FIELD_FX.velocityTempo,
  };
}

export function fieldFxVars(fx: FieldFx): Record<string, string> {
  return {
    "--fx-progress": fx.progress.toFixed(4),
    "--fx-velocity": fx.velocity.toFixed(4),
    "--fx-look-x": fx.lookX.toFixed(4),
    "--fx-look-y": fx.lookY.toFixed(4),
    "--fx-spin": `${fx.spin.toFixed(2)}deg`,
    "--fx-sweep": `${fx.sweep.toFixed(2)}deg`,
    "--fx-glow": fx.glow.toFixed(3),
    "--fx-pulse": fx.pulse.toFixed(3),
    "--fx-tempo": fx.tempo.toFixed(3),
    "--fx-warp": fx.warp.toFixed(3),
  };
}

export function applyFieldFx(target: FieldFxTarget, fx: FieldFx): void {
  const vars = fieldFxVars(fx);
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
}

/** Live page progress from the scrolling root so Lenis autoplay and wheel share one signal. */
export function scrollProgressFromRoot(
  root: { scrollHeight: number; clientHeight: number; scrollTop: number },
  fallback = 0,
): number {
  const max = root.scrollHeight - root.clientHeight;
  if (max <= 0) return clamp(fallback);
  return clamp(root.scrollTop / max);
}

export function pointerLook(clientX: number, clientY: number, width: number, height: number): FieldLook {
  const w = Math.max(width, 1);
  const h = Math.max(height, 1);
  return {
    x: clamp((clientX / w) * 2 - 1, -1, 1),
    y: clamp((clientY / h) * 2 - 1, -1, 1),
  };
}

export function dampLook(previous: number, target: number, dtMs: number): number {
  const mix = 1 - Math.exp(-Math.max(dtMs, 1) / FIELD_FX.lookDampMs);
  return lerp(previous, clamp(target, -1, 1), mix);
}

/**
 * Smooth |dProgress/dt| into 0–1 energy so autoplay crawls stay readable
 * while a flick or fast pointer still lights the field.
 */
export function dampVelocity(
  previous: number,
  deltaProgress: number,
  dtMs: number,
): number {
  const dt = Math.max(dtMs, 1);
  const inst = clamp((Math.abs(deltaProgress) / dt) * 1000 / FIELD_FX.velocityScale);
  const mix = 1 - Math.exp(-dt / FIELD_FX.velocityDampMs);
  return clamp(lerp(previous, inst, mix));
}

export function pointerEnergy(
  prevLook: FieldLook,
  nextLook: FieldLook,
  dtMs: number,
): number {
  const dt = Math.max(dtMs, 1);
  const dist = Math.hypot(nextLook.x - prevLook.x, nextLook.y - prevLook.y);
  return clamp((dist / dt) * 1000 / FIELD_FX.lookEnergyScale);
}
