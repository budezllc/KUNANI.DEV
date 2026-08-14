import { describe, expect, it } from "vitest";
import { LED_RING, SPACE, panelFrontAmount } from "./stageConfig";
import { FLOOR_FRAG, LED_FRAG, LED_VERT } from "./shaders";

describe("LED ring", () => {
  it("keeps panels transparent enough that HUD type can read through them", () => {
    expect(LED_RING.fillAlpha).toBeLessThanOrEqual(0.18);
    expect(LED_RING.rimAlpha).toBeLessThan(LED_RING.fillAlpha);
    expect(LED_RING.fillAlpha + LED_RING.rimAlpha).toBeLessThan(0.22);
  });

  it("bakes those alphas into the panel shader", () => {
    expect(LED_FRAG).toContain(LED_RING.fillAlpha.toFixed(3));
    expect(LED_FRAG).toContain(LED_RING.rimAlpha.toFixed(3));
  });

  it("fades a panel when it sits between the camera and the origin", () => {
    const camera = { x: 0, y: 2, z: 9 };
    const inFront = panelFrontAmount({ x: 0, y: 1.2, z: 5 }, camera);
    const offToSide = panelFrontAmount({ x: 8, y: 1.2, z: 0 }, camera);
    expect(inFront).toBeGreaterThan(0.7);
    expect(offToSide).toBeLessThan(0.35);
    expect(LED_RING.frontAxisRadius).toBeGreaterThan(1);
    expect(LED_RING.frontAlpha).toBeLessThan(0.15);
    expect(LED_VERT).toContain("cameraPosition");
    expect(LED_FRAG).toContain("vFront");
    expect(LED_FRAG).toContain(LED_RING.frontAlpha.toFixed(3));
  });

  it("offsets the ring so a panel is not parked on the camera axis", () => {
    expect(LED_RING.angleOffset).toBeGreaterThan(0);
    const facingCamera = Array.from({ length: LED_RING.count }, (_, i) => {
      const a = (i / LED_RING.count) * Math.PI * 2 + LED_RING.angleOffset;
      return Math.abs(Math.cos(a));
    });
    expect(Math.max(...facingCamera)).toBeLessThan(0.95);
  });
});

describe("black hole disc", () => {
  it("renders an event horizon and a photon ring instead of a grid floor", () => {
    expect(FLOOR_FRAG).toContain("horizon");
    expect(FLOOR_FRAG).toContain("photon");
    expect(FLOOR_FRAG).toContain("nebula");
  });

  it("keeps the event horizon small enough that it does not cover the hero", () => {
    expect(SPACE.holeRadius).toBeLessThanOrEqual(0.5);
    expect(SPACE.horizon).toBeLessThan(0.1);
    expect(SPACE.holeRadius).toBeLessThanOrEqual(SPACE.discRadius * SPACE.horizon);
    expect(FLOOR_FRAG).toContain(SPACE.horizon.toFixed(3));
  });
});
