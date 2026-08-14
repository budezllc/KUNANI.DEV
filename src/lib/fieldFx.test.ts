import { describe, expect, it } from "vitest";
import {
  FIELD_FX,
  applyFieldFx,
  dampLook,
  dampVelocity,
  fieldFxFromScroll,
  fieldFxVars,
  pointerEnergy,
  pointerLook,
  scrollProgressFromRoot,
} from "./fieldFx";

describe("fieldFxFromScroll", () => {
  it("clamps progress, velocity, and look", () => {
    const fx = fieldFxFromScroll(-1, -4, { x: -8, y: 9 });
    expect(fx.progress).toBe(0);
    expect(fx.velocity).toBe(0);
    expect(fx.lookX).toBe(-1);
    expect(fx.lookY).toBe(1);
    expect(fieldFxFromScroll(2, 9).progress).toBe(1);
    expect(fieldFxFromScroll(2, 9).velocity).toBe(1);
  });

  it("flies the camera and spins the rings as the page travels", () => {
    const start = fieldFxFromScroll(0, 0);
    const end = fieldFxFromScroll(1, 0);
    expect(start.cameraZ).toBe(0);
    expect(end.cameraZ).toBe(FIELD_FX.cameraTravel);
    expect(end.spin).toBe(FIELD_FX.spinTravel);
    expect(end.scan).toBeGreaterThan(start.scan);
    expect(end.sweep).toBeGreaterThan(start.sweep);
  });

  it("steers with pointer look even when scroll is still", () => {
    const left = fieldFxFromScroll(0.2, 0, { x: -1, y: 0 });
    const right = fieldFxFromScroll(0.2, 0, { x: 1, y: 0.4 });
    expect(right.lookX).toBeGreaterThan(left.lookX);
    expect(right.spin).toBeGreaterThan(left.spin);
    expect(right.sweep).toBeGreaterThan(left.sweep);
    expect(right.lookY).toBeGreaterThan(left.lookY);
  });

  it("brightens and warps when scroll or pointer energy rises", () => {
    const still = fieldFxFromScroll(0.4, 0);
    const moving = fieldFxFromScroll(0.4, 1);
    expect(moving.glow).toBeGreaterThan(still.glow);
    expect(moving.pulse).toBeGreaterThan(still.pulse);
    expect(moving.tempo).toBeGreaterThan(still.tempo);
    expect(moving.warp).toBeGreaterThan(still.warp);
  });

  it("is deterministic for the same inputs", () => {
    expect(fieldFxFromScroll(0.37, 0.2, { x: 0.1, y: -0.2 })).toEqual(
      fieldFxFromScroll(0.37, 0.2, { x: 0.1, y: -0.2 }),
    );
  });
});

describe("fieldFxVars", () => {
  it("exports CSS custom properties the HUD can bind", () => {
    const vars = fieldFxVars(fieldFxFromScroll(0.5, 0.25, { x: 0.4, y: -0.2 }));
    expect(vars["--fx-spin"]).toMatch(/deg$/);
    expect(vars["--fx-sweep"]).toMatch(/deg$/);
    expect(Number(vars["--fx-look-x"])).toBeCloseTo(0.4);
    expect(Number(vars["--fx-look-y"])).toBeCloseTo(-0.2);
    expect(Number(vars["--fx-tempo"])).toBeGreaterThan(FIELD_FX.idleTempo);
  });
});

describe("applyFieldFx", () => {
  it("writes those variables onto a style target", () => {
    const set = new Map<string, string>();
    applyFieldFx(
      { style: { setProperty: (name, value) => set.set(name, value) } },
      fieldFxFromScroll(1, 0),
    );
    expect(set.get("--fx-spin")).toBe(`${FIELD_FX.spinTravel.toFixed(2)}deg`);
    expect(set.get("--fx-progress")).toBe("1.0000");
  });
});

describe("scrollProgressFromRoot", () => {
  it("reads the same 0–1 progress for a manual jump and an autoplay crawl", () => {
    const root = { scrollHeight: 5000, clientHeight: 1000, scrollTop: 0 };
    expect(scrollProgressFromRoot(root)).toBe(0);
    root.scrollTop = 2000;
    expect(scrollProgressFromRoot(root)).toBe(0.5);
    root.scrollTop = 4000;
    expect(scrollProgressFromRoot(root)).toBe(1);
  });

  it("falls back when the page cannot scroll yet", () => {
    expect(
      scrollProgressFromRoot({ scrollHeight: 800, clientHeight: 800, scrollTop: 0 }, 0.3),
    ).toBe(0.3);
  });
});

describe("pointerLook", () => {
  it("maps the viewport to -1…1 look", () => {
    expect(pointerLook(0, 0, 100, 100)).toEqual({ x: -1, y: -1 });
    expect(pointerLook(50, 50, 100, 100)).toEqual({ x: 0, y: 0 });
    expect(pointerLook(100, 100, 100, 100)).toEqual({ x: 1, y: 1 });
  });
});

describe("dampLook", () => {
  it("eases toward the pointer instead of snapping", () => {
    const stepped = dampLook(0, 1, 16);
    expect(stepped).toBeGreaterThan(0);
    expect(stepped).toBeLessThan(1);
  });
});

describe("pointerEnergy", () => {
  it("lights up when the pointer travels quickly", () => {
    const flick = pointerEnergy({ x: 0, y: 0 }, { x: 0.4, y: -0.3 }, 16);
    const rest = pointerEnergy({ x: 0.1, y: 0.1 }, { x: 0.1, y: 0.1 }, 16);
    expect(flick).toBeGreaterThan(0.2);
    expect(rest).toBe(0);
  });
});

describe("dampVelocity", () => {
  it("rises when progress jumps and decays when scrolling stops", () => {
    const burst = dampVelocity(0, 0.08, 16);
    expect(burst).toBeGreaterThan(0.15);
    let energy = burst;
    for (let i = 0; i < 40; i += 1) {
      energy = dampVelocity(energy, 0, 16);
    }
    expect(energy).toBeLessThan(0.05);
  });

  it("stays quieter during a crawl like autoplay follow-scroll than a flick", () => {
    const crawl = dampVelocity(0, 0.002, 200);
    const flick = dampVelocity(0, 0.08, 16);
    expect(crawl).toBeLessThan(flick);
  });
});
