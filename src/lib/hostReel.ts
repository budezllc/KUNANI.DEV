import { clamp } from "./math";

export const HOST_FRAMES = [
  "/media/host/00.png",
  "/media/host/01.png",
  "/media/host/02.png",
  "/media/host/03.png",
  "/media/host/04.png",
  "/media/host/05.png",
  "/media/host/06.png",
  "/media/host/07.png",
] as const;

export type HostFrameBlend = {
  from: number;
  to: number;
  mix: number;
};

/** Map 0–1 page progress across the host stills. Same signal for wheel and autoplay. */
export function hostFrameBlend(
  progress: number,
  count: number = HOST_FRAMES.length,
): HostFrameBlend {
  if (count <= 0) throw new Error("count must be > 0");
  if (count === 1) return { from: 0, to: 0, mix: 0 };
  const scaled = clamp(progress) * (count - 1);
  const from = Math.min(Math.floor(scaled), count - 2);
  return { from, to: from + 1, mix: scaled - from };
}

export function hostParallax(
  lookX: number,
  lookY: number,
): { x: number; y: number } {
  return {
    x: clamp(lookX, -1, 1) * 22,
    y: clamp(lookY, -1, 1) * 14,
  };
}
