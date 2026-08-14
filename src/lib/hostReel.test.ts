import { describe, expect, it } from "vitest";
import { HOST_FRAMES, hostFrameBlend, hostParallax } from "./hostReel";

describe("hostFrameBlend", () => {
  it("starts on the closed face and ends on the closed face after the orbit", () => {
    expect(HOST_FRAMES).toHaveLength(8);
    expect(hostFrameBlend(0)).toEqual({ from: 0, to: 1, mix: 0 });
    const end = hostFrameBlend(1);
    expect(end.from).toBe(6);
    expect(end.to).toBe(7);
    expect(end.mix).toBe(1);
  });

  it("crossfades neighboring stills as the page travels", () => {
    const mid = hostFrameBlend(0.5);
    expect(mid.to).toBe(mid.from + 1);
    expect(mid.from).toBeGreaterThanOrEqual(0);
    expect(mid.to).toBeLessThan(HOST_FRAMES.length);
    const a = hostFrameBlend(0.2);
    const b = hostFrameBlend(0.8);
    expect(b.from).toBeGreaterThan(a.from);
  });

  it("is the same for a given progress whether the user or autoplay moved there", () => {
    expect(hostFrameBlend(0.37)).toEqual(hostFrameBlend(0.37));
  });
});

describe("hostParallax", () => {
  it("steers the still with pointer look", () => {
    expect(hostParallax(0, 0)).toEqual({ x: 0, y: 0 });
    expect(hostParallax(1, -1).x).toBeGreaterThan(0);
    expect(hostParallax(1, -1).y).toBeLessThan(0);
  });
});
