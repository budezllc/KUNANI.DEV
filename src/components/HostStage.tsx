import { useEffect, useRef } from "react";
import { dampLook, pointerLook, scrollProgressFromRoot } from "../lib/fieldFx";
import { HOST_FRAMES, hostFrameBlend, hostParallax } from "../lib/hostReel";

type Props = {
  progress: number;
  reducedMotion: boolean;
};

export function HostStage({ progress, reducedMotion }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLImageElement>(null);
  const toRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    for (const src of HOST_FRAMES) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  useEffect(() => {
    const node = root.current;
    const fromImg = fromRef.current;
    const toImg = toRef.current;
    if (!node || !fromImg || !toImg) return;

    const lookTarget = { x: 0, y: 0 };
    let look = { x: 0, y: 0 };
    let lastFrom = -1;
    let lastTo = -1;
    let prevTime = performance.now();
    let frame = 0;

    const onPointer = (event: PointerEvent) => {
      lookTarget.x = pointerLook(event.clientX, event.clientY, window.innerWidth, window.innerHeight).x;
      lookTarget.y = pointerLook(event.clientX, event.clientY, window.innerWidth, window.innerHeight).y;
    };

    const readProgress = () =>
      scrollProgressFromRoot(
        {
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: document.documentElement.clientHeight,
          scrollTop: window.scrollY || document.documentElement.scrollTop,
        },
        progressRef.current,
      );

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
      const p = reducedMotion ? 0 : readProgress();
      const blend = hostFrameBlend(p);
      const shift = hostParallax(look.x, look.y);
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
      node.style.setProperty("--host-x", `${shift.x.toFixed(2)}px`);
      node.style.setProperty("--host-y", `${shift.y.toFixed(2)}px`);
      frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reducedMotion]);

  return (
    <div ref={root} className="host-stage">
      <img
        ref={fromRef}
        className="host-frame"
        alt=""
        src={HOST_FRAMES[0]}
        draggable={false}
      />
      <img
        ref={toRef}
        className="host-frame"
        alt=""
        src={HOST_FRAMES[1]}
        draggable={false}
      />
    </div>
  );
}
