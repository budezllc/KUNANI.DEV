import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { chapterIds } from "../lib/catalog";
import {
  HIDDEN_VIEW,
  PLAYBACK,
  buildTimeline,
  chapterUnlocked,
  eventView,
  isHashNavHref,
  isUserScrollKey,
  followScrollDelta,
  playbackAt,
  scrollCue,
  snapToBottomDelta,
  fitInViewDelta,
  shouldAutoplay,
  snapshotChanged,
  voiceState,
  type EventView,
  type PlaybackSnapshot,
  type VoiceState,
} from "../lib/playback";
import { sessionEvents, type CommsEvent } from "../lib/session";

type ScrollTo = (
  target: string | number,
  opts?: { duration?: number; offset?: number; relative?: boolean; onComplete?: () => void },
) => void;

type PlaybackApi = {
  mode: "playing" | "idle";
  snap: PlaybackSnapshot;
  events: CommsEvent[];
  view: (eventId: string) => EventView;
  chapterOn: (chapterId: string) => boolean;
  interrupt: () => void;
  voice: VoiceState;
};

const PlaybackContext = createContext<PlaybackApi | null>(null);

function initialMode(reducedMotion: boolean): "playing" | "idle" {
  if (typeof window === "undefined") return "idle";
  return shouldAutoplay({ reducedMotion, hash: window.location.hash })
    ? "playing"
    : "idle";
}

export function PlaybackProvider({
  children,
  reducedMotion,
  scrollTo,
}: {
  children: ReactNode;
  reducedMotion: boolean;
  scrollTo: ScrollTo;
}) {
  const events = useMemo(() => sessionEvents(), []);
  const beats = useMemo(() => buildTimeline(events), [events]);
  const ids = useMemo(() => chapterIds(), []);
  const [mode, setMode] = useState<"playing" | "idle">(() =>
    initialMode(reducedMotion),
  );
  const [snap, setSnap] = useState<PlaybackSnapshot>(() =>
    playbackAt(mode === "playing" ? 0 : Number.POSITIVE_INFINITY, beats),
  );

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const scrollToRef = useRef(scrollTo);
  scrollToRef.current = scrollTo;
  const programmatic = useRef(false);

  const interrupt = useCallback(() => {
    if (modeRef.current !== "playing") return;
    programmatic.current = false;
    setMode("idle");
  }, []);

  useEffect(() => {
    if (reducedMotion && mode === "playing") setMode("idle");
  }, [reducedMotion, mode]);

  useEffect(() => {
    if (mode !== "playing") return;

    let elapsed = 0;
    let last = performance.now();
    let paused = false;
    let finished = false;
    let frame = 0;
    let cancelled = false;
    let scrollToken = 0;
    const timers: number[] = [];

    const apply = (next: PlaybackSnapshot) => {
      if (cancelled) return;
      const cue = scrollCue(snapRef.current, next);
      if (snapshotChanged(snapRef.current, next)) setSnap(next);
      if (cue?.mode === "snap" || cue?.mode === "fit") {
        paused = true;
        programmatic.current = true;
        const my = ++scrollToken;
        const settle = () => {
          if (cancelled || my !== scrollToken) return;
          programmatic.current = false;
          if (cue.mode === "fit") {
            paused = true;
            finished = true;
            return;
          }
          paused = false;
          last = performance.now();
        };
        const runSnap = () => {
          if (cancelled || my !== scrollToken) return;
          const node = document.querySelector(cue.selector);
          if (!(node instanceof HTMLElement)) {
            settle();
            return;
          }
          const rect = node.getBoundingClientRect();
          const viewport = {
            header: PLAYBACK.headerPx,
            footer:
              cue.mode === "fit" ? PLAYBACK.fitFooterPx : PLAYBACK.snapFooterPx,
            height: window.innerHeight,
          };
          const delta =
            cue.mode === "fit"
              ? fitInViewDelta(rect, viewport)
              : snapToBottomDelta(rect, viewport);
          if (Math.abs(delta) < 3) {
            settle();
            return;
          }
          scrollToRef.current(delta, {
            duration: 0.9,
            relative: true,
            onComplete: settle,
          });
          timers.push(window.setTimeout(settle, 1200));
        };
        requestAnimationFrame(() => {
          timers.push(window.setTimeout(runSnap, 80));
        });
        return;
      }
      if (next.done) {
        finished = true;
        return;
      }
      if (cue?.mode === "follow") {
        const node = document.querySelector(cue.selector);
        if (!(node instanceof HTMLElement)) return;
        const delta = followScrollDelta(node.getBoundingClientRect(), {
          header: PLAYBACK.headerPx,
          footer: PLAYBACK.snapFooterPx,
          height: window.innerHeight,
        });
        if (Math.abs(delta) >= 3) {
          scrollToRef.current(delta, { duration: 0.2, relative: true });
        }
      }
    };

    const raf = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!paused) {
        elapsed += dt;
        apply(playbackAt(elapsed, beats));
      }
      if (!cancelled && !finished && modeRef.current === "playing") {
        frame = requestAnimationFrame(raf);
      }
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [mode, beats]);

  useEffect(() => {
    if (mode !== "playing") return;

    const onWheel = () => {
      if (!programmatic.current) interrupt();
    };
    const onTouch = () => {
      if (!programmatic.current) interrupt();
    };
    const onKey = (event: KeyboardEvent) => {
      if (isUserScrollKey(event.key) && !programmatic.current) interrupt();
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (isHashNavHref(link?.getAttribute("href") ?? null)) interrupt();
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: true });
    window.addEventListener("touchmove", onTouch, { capture: true, passive: true });
    window.addEventListener("keydown", onKey, { capture: true });
    window.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchmove", onTouch, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
      window.removeEventListener("click", onClick, { capture: true });
    };
  }, [mode, interrupt]);

  const idle = mode === "idle";
  const value = useMemo<PlaybackApi>(
    () => ({
      mode,
      snap,
      events,
      view: (eventId) => {
        const event = events.find((item) => item.id === eventId);
        if (!event) return HIDDEN_VIEW;
        return eventView(event, snap, idle);
      },
      chapterOn: (chapterId) => chapterUnlocked(chapterId, snap, ids, idle),
      interrupt,
      voice: voiceState(snap, idle),
    }),
    [mode, snap, events, ids, idle, interrupt],
  );

  return createElement(PlaybackContext.Provider, { value }, children);
}

export function usePlayback(): PlaybackApi {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback requires PlaybackProvider");
  return ctx;
}
