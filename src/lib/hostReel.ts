import { clamp } from "./math";

export const HOST_VIDEO = "/media/host/host.mp4";

/** MiniMax plate: ~6s @ 60fps. Autoplay slows it to ~27fps so the orbit lasts longer. */
export const HOST_CLIP = { durationSec: 6, fps: 60 } as const;
export const HOST_MIN_PLAYBACK_FPS = 27;

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

/** Map 0–1 page progress onto a paused clip. Used for wheel scrub, not autoplay. */
export function hostVideoTime(progress: number, duration: number): number {
  if (!(duration > 0) || !Number.isFinite(duration)) return 0;
  const t = clamp(progress) * duration;
  const last = Math.max(0, duration - 1 / 120);
  return Math.min(t, last);
}

export function shouldSeekHostVideo(
  currentTime: number,
  targetTime: number,
  minDelta = 1 / 120,
): boolean {
  return Math.abs(currentTime - targetTime) >= minDelta;
}

/** Autoplay follow/snap must not drive the host — those scrolls are stepped. */
export function hostPlayAlong(
  mode: "playing" | "idle",
  reducedMotion: boolean,
): boolean {
  return mode === "playing" && !reducedMotion;
}

/** Slow 60fps to ~27fps during autoplay. */
export function hostPlaybackRate(fps: number = HOST_CLIP.fps): number {
  if (!(fps > 0) || !Number.isFinite(fps)) return 1;
  return clamp(HOST_MIN_PLAYBACK_FPS / fps, 0.0625, 1);
}

export function hostEffectiveClipSec(
  durationSec: number,
  fps: number = HOST_CLIP.fps,
): number {
  const rate = hostPlaybackRate(fps);
  if (!(durationSec > 0) || !Number.isFinite(durationSec) || rate <= 0) return 0;
  return durationSec / rate;
}

/** Still fallback while autoplay runs: realtime against the clip, not the session. */
export function hostClockProgress(
  elapsedMs: number,
  clipMs: number,
  loop = false,
): number {
  if (!(clipMs > 0) || !Number.isFinite(clipMs)) return 0;
  if (!loop) return clamp(elapsedMs / clipMs);
  const wrapped = ((elapsedMs % clipMs) + clipMs) % clipMs;
  return wrapped / clipMs;
}

/** A 15s 1x loop covers the ~83s autoplay wall clock. */
export function hostLoopsToCover(clipSec: number, coverSec: number): number {
  if (!(clipSec > 0) || !Number.isFinite(clipSec)) return 0;
  if (!(coverSec > 0) || !Number.isFinite(coverSec)) return 0;
  return Math.ceil(coverSec / clipSec);
}

/** 1x clip length that covers typing plus chapter snap/fit pauses. */
export function hostSuggestedClipSec(
  sessionMs: number,
  chapterEnds: number,
  pauseMs = 980,
): number {
  if (!(sessionMs > 0) || !Number.isFinite(sessionMs)) return 0;
  const ends = Math.max(0, chapterEnds);
  return Math.ceil((sessionMs + ends * pauseMs) / 1000);
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
