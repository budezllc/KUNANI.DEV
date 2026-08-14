import { Color } from "three";
import { hexToRgb, lerp } from "./math";
import type { WorldPalette } from "../data/types";

export function lerpPalette(
  a: WorldPalette,
  b: WorldPalette,
  t: number,
): WorldPalette {
  return {
    primary: lerpHexThree(a.primary, b.primary, t),
    secondary: lerpHexThree(a.secondary, b.secondary, t),
    accent: lerpHexThree(a.accent, b.accent, t),
    fog: lerpHexThree(a.fog, b.fog, t),
  };
}

function lerpHexThree(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const color = new Color(
    lerp(ar, br, t) / 255,
    lerp(ag, bg, t) / 255,
    lerp(ab, bb, t) / 255,
  );
  return `#${color.getHexString()}`;
}
