export function youtubeEmbedSrc(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

const LOCAL_IMAGE = /^\/[A-Za-z0-9._/-]+\.(png|jpe?g|webp|gif)$/i;

export function isLocalImageSrc(src: string): boolean {
  return LOCAL_IMAGE.test(src);
}

/** Shared YouTube / still-image frame. Portrait covers must contain inside this box. */
export const REEL_FRAME = {
  maxWidthRem: 36,
  aspectWidth: 16,
  aspectHeight: 9,
} as const;

export function reelFrameHeight(width: number): number {
  return (width * REEL_FRAME.aspectHeight) / REEL_FRAME.aspectWidth;
}

export function containInReel(
  image: { width: number; height: number },
  frameWidth = REEL_FRAME.maxWidthRem,
): { width: number; height: number } {
  const frame = { width: frameWidth, height: reelFrameHeight(frameWidth) };
  if (image.width <= 0 || image.height <= 0) {
    return { width: 0, height: 0 };
  }
  const scale = Math.min(
    frame.width / image.width,
    frame.height / image.height,
    1,
  );
  return {
    width: image.width * scale,
    height: image.height * scale,
  };
}
