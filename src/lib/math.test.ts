import { describe, expect, it } from "vitest";
import { blendIndex, clamp, hexToRgb, lerpHex } from "./math";

describe("math", () => {
  it("clamps to 0–1", () => {
    expect(clamp(-2)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.4)).toBe(0.4);
  });

  it("parses and lerps hex palettes", () => {
    expect(hexToRgb("#ff0000")).toEqual([255, 0, 0]);
    expect(lerpHex("#000000", "#ffffff", 0.5)).toBe("#808080");
  });

  it("throws on invalid hex", () => {
    expect(() => hexToRgb("#fff")).toThrow(/invalid hex/);
  });

  it("blends chapter indices across a reel", () => {
    expect(blendIndex(0, 3)).toEqual({ index: 0, next: 1, mix: 0 });
    expect(blendIndex(1, 3)).toEqual({ index: 1, next: 2, mix: 1 });
    const mid = blendIndex(0.25, 3);
    expect(mid.index).toBe(0);
    expect(mid.next).toBe(1);
    expect(mid.mix).toBeCloseTo(0.5);
  });

  it("handles a single chapter", () => {
    expect(blendIndex(0.8, 1)).toEqual({ index: 0, next: 0, mix: 0 });
  });
});
