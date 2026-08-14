import { describe, expect, it } from "vitest";
import { getProjectBySlug } from "./catalog";
import {
  REEL_FRAME,
  containInReel,
  isLocalImageSrc,
  reelFrameHeight,
  youtubeEmbedSrc,
} from "./media";

describe("media", () => {
  it("builds privacy-enhanced embeds for both reels", () => {
    const stage = getProjectBySlug("virtual-stage");
    const shmup = getProjectBySlug("super-shmup");
    expect(stage?.media?.kind).toBe("youtube");
    expect(shmup?.media?.kind).toBe("youtube");
    if (stage?.media?.kind !== "youtube" || shmup?.media?.kind !== "youtube") {
      throw new Error("expected youtube media");
    }
    expect(youtubeEmbedSrc(stage.media.id)).toBe(
      "https://www.youtube-nocookie.com/embed/4HlekgKyvTA?rel=0",
    );
    expect(youtubeEmbedSrc(shmup.media.id)).toBe(
      "https://www.youtube-nocookie.com/embed/AqRvpqR8CFs?rel=0",
    );
  });

  it("keeps the Zork Reborn snapshot as a local public path", () => {
    const zork = getProjectBySlug("zork-reborn");
    expect(zork?.media?.kind).toBe("image");
    if (zork?.media?.kind !== "image") throw new Error("expected image media");
    expect(zork.media.src).toBe("/media/zork-reborn.png");
    expect(isLocalImageSrc(zork.media.src)).toBe(true);
    expect(isLocalImageSrc("https://example.com/zork.png")).toBe(false);
  });

  it("keeps the Side Eye snapshot as a local public path", () => {
    const sideEye = getProjectBySlug("side-eye");
    expect(sideEye?.media?.kind).toBe("image");
    if (sideEye?.media?.kind !== "image") throw new Error("expected image media");
    expect(sideEye.media.src).toBe("/media/side-eye.png");
    expect(isLocalImageSrc(sideEye.media.src)).toBe(true);
  });

  it("keeps the Switchyard snapshot as a local public path", () => {
    const switchyard = getProjectBySlug("switchyard");
    expect(switchyard?.media?.kind).toBe("image");
    if (switchyard?.media?.kind !== "image") throw new Error("expected image media");
    expect(switchyard.media.src).toBe("/media/switchyard.png");
    expect(isLocalImageSrc(switchyard.media.src)).toBe(true);
  });

  it("keeps the Token Savers snapshot as a local public path", () => {
    const savers = getProjectBySlug("token-savers");
    expect(savers?.media?.kind).toBe("image");
    if (savers?.media?.kind !== "image") throw new Error("expected image media");
    expect(savers.media.src).toBe("/media/token-savers.png");
    expect(isLocalImageSrc(savers.media.src)).toBe(true);
  });

  it("keeps the CAPTURE! Extremities cover as a local public path", () => {
    const capture = getProjectBySlug("capture");
    expect(capture?.media?.kind).toBe("image");
    if (capture?.media?.kind !== "image") throw new Error("expected image media");
    expect(capture.media.src).toBe("/media/capture.png");
    expect(isLocalImageSrc(capture.media.src)).toBe(true);
  });

  it("contains a tall Extremities cover inside the 16:9 reel box", () => {
    const frameH = reelFrameHeight(REEL_FRAME.maxWidthRem);
    expect(frameH).toBe(REEL_FRAME.maxWidthRem * 9 / 16);
    const cover = containInReel({ width: 600, height: 900 });
    expect(cover.height).toBeCloseTo(frameH);
    expect(cover.width).toBeLessThan(REEL_FRAME.maxWidthRem);
    expect(cover.height).toBeLessThan(900);
  });
});
