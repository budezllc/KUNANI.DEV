import { describe, expect, it } from "vitest";
import {
  HOST_CLIP,
  HOST_FRAMES,
  HOST_MIN_PLAYBACK_FPS,
  HOST_VIDEO,
  hostClockProgress,
  hostEffectiveClipSec,
  hostFrameBlend,
  hostLoopsToCover,
  hostParallax,
  hostPlayAlong,
  hostPlaybackRate,
  hostSuggestedClipSec,
  hostVideoTime,
  shouldSeekHostVideo,
} from "./hostReel";
import { chapterIds } from "./catalog";
import { buildTimeline, totalDuration } from "./playback";
import { sessionEvents } from "./session";

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

describe("hostVideoTime", () => {
  it("maps page progress onto the clip duration", () => {
    expect(HOST_VIDEO).toBe("/media/host/host.mp4");
    expect(hostVideoTime(0, 5.166667)).toBe(0);
    expect(hostVideoTime(0.5, 10)).toBe(5);
    expect(hostVideoTime(1, 10)).toBeCloseTo(10 - 1 / 120);
  });

  it("is the same for a given progress whether the user or autoplay moved there", () => {
    expect(hostVideoTime(0.37, 5.166667)).toBe(hostVideoTime(0.37, 5.166667));
  });

  it("stays at 0 when duration is missing", () => {
    expect(hostVideoTime(0.5, 0)).toBe(0);
    expect(hostVideoTime(0.5, Number.NaN)).toBe(0);
  });
});

describe("shouldSeekHostVideo", () => {
  it("skips sub-frame seeks so the decoder is not hammered", () => {
    expect(shouldSeekHostVideo(1, 1.004, 1 / 120)).toBe(false);
    expect(shouldSeekHostVideo(1, 1.02, 1 / 120)).toBe(true);
  });
});

describe("hostPlayAlong", () => {
  it("plays through autoplay instead of scrubbing the snap/follow jumps", () => {
    expect(hostPlayAlong("playing", false)).toBe(true);
    expect(hostPlayAlong("idle", false)).toBe(false);
    expect(hostPlayAlong("playing", true)).toBe(false);
  });
});

describe("hostPlaybackRate", () => {
  it("slows 60fps to about 24fps so autoplay lasts longer without ticking", () => {
    expect(hostPlaybackRate(60)).toBeCloseTo(0.4);
    expect(hostPlaybackRate(24)).toBe(1);
    expect(HOST_MIN_PLAYBACK_FPS).toBe(24);
    expect(hostEffectiveClipSec(6, 60)).toBeCloseTo(15);
  });
});

describe("hostClockProgress", () => {
  it("walks the clip in realtime even when scroll is paused for a snap", () => {
    expect(hostClockProgress(0, 6_000)).toBe(0);
    expect(hostClockProgress(3_000, 6_000)).toBe(0.5);
    expect(hostClockProgress(8_000, 6_000)).toBe(1);
  });

  it("wraps when autoplay outlasts the clip", () => {
    expect(hostClockProgress(6_000, 6_000, true)).toBe(0);
    expect(hostClockProgress(9_000, 6_000, true)).toBe(0.5);
  });
});

describe("hostLoopsToCover", () => {
  it("loops the slowed 60fps plate through the autoplay wall clock", () => {
    expect(HOST_CLIP).toEqual({ durationSec: 6, fps: 60 });
    const sessionMs = totalDuration(buildTimeline(sessionEvents()));
    const cover = hostSuggestedClipSec(sessionMs, chapterIds().length);
    expect(hostLoopsToCover(hostEffectiveClipSec(HOST_CLIP.durationSec), cover)).toBe(6);
  });
});

describe("hostSuggestedClipSec", () => {
  it("asks for a 1x clip that lasts the whole autoplay including snap pauses", () => {
    const sessionMs = totalDuration(buildTimeline(sessionEvents()));
    const sec = hostSuggestedClipSec(sessionMs, chapterIds().length);
    expect(sessionMs).toBe(71_690);
    expect(chapterIds()).toHaveLength(11);
    expect(sec).toBe(83);
  });
});

describe("hostParallax", () => {
  it("steers the still with pointer look", () => {
    expect(hostParallax(0, 0)).toEqual({ x: 0, y: 0 });
    expect(hostParallax(1, -1).x).toBeGreaterThan(0);
    expect(hostParallax(1, -1).y).toBeLessThan(0);
  });
});
