import { site } from "../data/site";

export const UPLINK = {
  connecting: "Connecting to Starlink",
  lockMs: 3200,
} as const;

export type UplinkPhase = "connecting" | "locked";

export function uplinkLockedLabel(location = site.location): string {
  return `${location} NV`;
}

export function uplinkPhaseAt(
  elapsedMs: number,
  opts: { reducedMotion?: boolean; lockMs?: number } = {},
): UplinkPhase {
  if (opts.reducedMotion) return "locked";
  return elapsedMs >= (opts.lockMs ?? UPLINK.lockMs) ? "locked" : "connecting";
}

export function uplinkReadout(phase: UplinkPhase): string {
  return phase === "connecting" ? UPLINK.connecting : uplinkLockedLabel();
}
