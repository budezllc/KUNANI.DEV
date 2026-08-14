import { useEffect, useRef, useState } from "react";
import { usePlayback } from "../hooks/useSessionPlayback";
import { dampLook, pointerLook } from "../lib/fieldFx";
import {
  HOST_CLIP,
  HOST_FRAMES,
  HOST_VIDEO,
  hostClockProgress,
  hostFrameBlend,
  hostParallax,
  hostPlayAlong,
  hostPlaybackRate,
  hostVideoTime,
  shouldSeekHostVideo,
} from "../lib/hostReel";

type Props = {
  progress: number;
  reducedMotion: boolean;
};

export function HostStage({ progress, reducedMotion }: Props) {
  const { mode } = usePlayback();
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fromRef = useRef<HTMLImageElement>(null);
  const toRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [useStills, setUseStills] = useState(false);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    const lookTarget = { x: 0, y: 0 };
    let look = { x: 0, y: 0 };
    let lastFrom = -1;
    let lastTo = -1;
    let prevTime = performance.now();
    let playOrigin: number | null = null;
    let playFailed = false;
    let frame = 0;

    const onPointer = (event: PointerEvent) => {
      const next = pointerLook(
        event.clientX,
        event.clientY,
        window.innerWidth,
        window.innerHeight,
      );
      lookTarget.x = next.x;
      lookTarget.y = next.y;
    };

    const paint = (now: number) => {
      const dt = Math.max(1, now - prevTime);
      prevTime = now;
      if (!reducedMotion) {
        look = {
          x: dampLook(look.x, lookTarget.x, dt),
          y: dampLook(look.y, lookTarget.y, dt),
        };
      } else {
        look = { x: 0, y: 0 };
      }
      const playAlong = hostPlayAlong(modeRef.current, reducedMotion);
      if (playAlong) {
        if (playOrigin == null) playOrigin = now;
      } else {
        playOrigin = null;
      }
      const rate = hostPlaybackRate();
      const sourceMs =
        videoRef.current &&
        Number.isFinite(videoRef.current.duration) &&
        videoRef.current.duration > 0
          ? videoRef.current.duration * 1000
          : HOST_CLIP.durationSec * 1000;
      const clipMs = playAlong ? sourceMs / rate : sourceMs;
      const p = reducedMotion
        ? 0
        : playAlong
          ? hostClockProgress(now - (playOrigin ?? now), clipMs, true)
          : progressRef.current;
      const shift = hostParallax(look.x, look.y);
      node.style.setProperty("--host-x", `${shift.x.toFixed(2)}px`);
      node.style.setProperty("--host-y", `${shift.y.toFixed(2)}px`);

      const video = videoRef.current;
      if (video) {
        const duration = video.duration;
        const ready =
          video.readyState >= 1 && Number.isFinite(duration) && duration > 0;
        if (playAlong && ready && !playFailed) {
          video.loop = true;
          video.playbackRate = rate;
          if (video.paused) {
            const attempt = video.play();
            if (attempt) {
              void attempt.catch(() => {
                playFailed = true;
              });
            }
          }
        } else {
          video.loop = false;
          if (!video.paused) video.pause();
          if (ready && !video.seeking) {
            const t = hostVideoTime(p, duration);
            if (shouldSeekHostVideo(video.currentTime, t)) {
              video.currentTime = t;
            }
          }
        }
      }

      const fromImg = fromRef.current;
      const toImg = toRef.current;
      if (fromImg && toImg) {
        const blend = hostFrameBlend(p);
        if (blend.from !== lastFrom) {
          fromImg.src = HOST_FRAMES[blend.from];
          lastFrom = blend.from;
        }
        if (blend.to !== lastTo) {
          toImg.src = HOST_FRAMES[blend.to];
          lastTo = blend.to;
        }
        fromImg.style.opacity = String(1 - blend.mix);
        toImg.style.opacity = String(blend.mix);
      }

      frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reducedMotion, useStills]);

  return (
    <div ref={root} className="host-stage">
      {useStills ? (
        <>
          <img
            ref={fromRef}
            className="host-frame"
            alt=""
            src={HOST_FRAMES[0]}
            width={1024}
            height={1536}
            draggable={false}
          />
          <img
            ref={toRef}
            className="host-frame"
            alt=""
            src={HOST_FRAMES[1]}
            width={1024}
            height={1536}
            draggable={false}
          />
        </>
      ) : (
        <video
          ref={videoRef}
          className="host-frame"
          muted
          playsInline
          preload="auto"
          poster={HOST_FRAMES[0]}
          src={HOST_VIDEO}
          width={1024}
          height={1332}
          onError={() => setUseStills(true)}
        />
      )}
    </div>
  );
}
