import { describe, expect, it } from "vitest";
import { site } from "../data/site";
import {
  UPLINK,
  uplinkLockedLabel,
  uplinkPhaseAt,
  uplinkReadout,
} from "./uplink";

describe("uplink", () => {
  it("acquires Starlink on load, then locks Las Vegas NV after a few seconds", () => {
    expect(uplinkPhaseAt(0)).toBe("connecting");
    expect(uplinkReadout("connecting")).toBe("Connecting to Starlink");
    expect(uplinkPhaseAt(UPLINK.lockMs - 1)).toBe("connecting");
    expect(uplinkPhaseAt(UPLINK.lockMs)).toBe("locked");
    expect(uplinkReadout("locked")).toBe("Las Vegas NV");
    expect(uplinkLockedLabel()).toBe(`${site.location} NV`);
    expect(UPLINK.lockMs).toBeGreaterThanOrEqual(2500);
    expect(UPLINK.lockMs).toBeLessThanOrEqual(5000);
  });

  it("skips the handshake when motion is reduced", () => {
    expect(uplinkPhaseAt(0, { reducedMotion: true })).toBe("locked");
    expect(uplinkReadout("locked")).toBe("Las Vegas NV");
  });
});
