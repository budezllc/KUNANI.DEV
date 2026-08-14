export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const n = Number.parseInt(value, 16);
  if (Number.isNaN(n) || value.length !== 6) {
    throw new Error(`invalid hex: ${hex}`);
  }
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (c: number) =>
    Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t));
}

export type ChapterBlend = {
  index: number;
  next: number;
  mix: number;
};

/** Map 0–1 page progress across n chapters. */
export function blendIndex(progress: number, count: number): ChapterBlend {
  if (count <= 0) {
    throw new Error("count must be > 0");
  }
  if (count === 1) {
    return { index: 0, next: 0, mix: 0 };
  }
  const scaled = clamp(progress) * (count - 1);
  const index = Math.min(Math.floor(scaled), count - 2);
  return { index, next: index + 1, mix: scaled - index };
}
