import Lenis from "lenis";
import { useCallback, useEffect, useRef } from "react";

type ScrollToOpts = {
  duration?: number;
  offset?: number;
  relative?: boolean;
  onComplete?: () => void;
};

export function useLenis(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      anchors: true,
    });
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  const scrollTo = useCallback((target: string | number, opts: ScrollToOpts = {}) => {
    const duration = opts.duration ?? 1.1;
    if (typeof target === "number") {
      const from = lenisRef.current?.scroll ?? window.scrollY;
      const y = opts.relative ? from + target : target;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(y, {
          duration,
          onComplete: opts.onComplete,
        });
        return;
      }
      window.scrollTo({ top: y, behavior: duration === 0 ? "auto" : "smooth" });
      window.setTimeout(() => opts.onComplete?.(), duration * 1000);
      return;
    }
    const node = document.querySelector(target);
    if (!(node instanceof HTMLElement)) {
      opts.onComplete?.();
      return;
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(node, {
        duration,
        offset: opts.offset ?? -72,
        onComplete: opts.onComplete,
      });
      return;
    }
    node.scrollIntoView({ behavior: duration === 0 ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => opts.onComplete?.(), duration * 1000);
  }, []);

  return { scrollTo };
}
