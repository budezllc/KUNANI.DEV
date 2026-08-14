import { chapterIds } from "./catalog";
import { sessionEvents, type CommsEvent } from "./session";

export const PLAYBACK = {
  msPerChar: 22,
  minTypeMs: 420,
  maxTypeMs: 2400,
  thinkMs: 1100,
  bootMs: 380,
  holdMs: 2400,
  headerPx: 72,
  snapFooterPx: 120,
  /** Listen bar plus air so the about socials sit above it, not behind it. */
  fitFooterPx: 176,
  /** Ignore load/trackpad noise so the reel can actually start moving. */
  interruptGraceMs: 900,
  interruptWheelPx: 6,
} as const;

export type BeatKind = "instant" | "type" | "think" | "hold";

export type Beat = {
  eventId: string;
  chapterId: string;
  kind: BeatKind;
  chars: number;
  durationMs: number;
};

export type PlaybackActive = {
  eventId: string;
  kind: Exclude<BeatKind, "hold">;
  chars: number;
  total: number;
};

export type PlaybackSnapshot = {
  done: boolean;
  beatIndex: number;
  chapterId: string;
  completedIds: string[];
  active: PlaybackActive | null;
};

export type EventView = {
  show: boolean;
  text: string;
  caret: boolean;
  complete: boolean;
};

export const HIDDEN_VIEW: EventView = {
  show: false,
  text: "",
  caret: false,
  complete: false,
};

export function typeDuration(chars: number): number {
  return Math.min(
    PLAYBACK.maxTypeMs,
    Math.max(PLAYBACK.minTypeMs, chars * PLAYBACK.msPerChar),
  );
}

export function charsShown(
  elapsedMs: number,
  totalChars: number,
  durationMs: number,
): number {
  if (totalChars <= 0) return 0;
  if (durationMs <= 0 || elapsedMs >= durationMs) return totalChars;
  return Math.min(totalChars, Math.floor((elapsedMs / durationMs) * totalChars));
}

export function buildTimeline(events: CommsEvent[] = sessionEvents()): Beat[] {
  const beats: Beat[] = [];
  for (const [index, event] of events.entries()) {
    if (event.role === "thinking") {
      beats.push({
        eventId: event.id,
        chapterId: event.chapterId,
        kind: "think",
        chars: event.body.length,
        durationMs: PLAYBACK.thinkMs,
      });
    } else if (event.role === "system") {
      beats.push({
        eventId: event.id,
        chapterId: event.chapterId,
        kind: "instant",
        chars: event.body.length,
        durationMs: PLAYBACK.bootMs,
      });
    } else {
      beats.push({
        eventId: event.id,
        chapterId: event.chapterId,
        kind: "type",
        chars: event.body.length,
        durationMs: typeDuration(event.body.length),
      });
    }
    const next = events[index + 1];
    if (!next || next.chapterId !== event.chapterId) {
      beats.push({
        eventId: `${event.id}::hold`,
        chapterId: event.chapterId,
        kind: "hold",
        chars: 0,
        durationMs: PLAYBACK.holdMs,
      });
    }
  }
  return beats;
}

export function totalDuration(beats: Beat[]): number {
  return beats.reduce((sum, beat) => sum + beat.durationMs, 0);
}

export function playbackAt(elapsedMs: number, beats: Beat[]): PlaybackSnapshot {
  const fallbackChapter = beats[0]?.chapterId ?? "hero";
  if (!beats.length) {
    return {
      done: true,
      beatIndex: 0,
      chapterId: fallbackChapter,
      completedIds: [],
      active: null,
    };
  }
  let remaining = Math.max(0, elapsedMs);
  const completedIds: string[] = [];
  for (let i = 0; i < beats.length; i += 1) {
    const beat = beats[i];
    if (remaining >= beat.durationMs) {
      remaining -= beat.durationMs;
      if (beat.kind !== "hold") completedIds.push(beat.eventId);
      continue;
    }
    const active: PlaybackActive | null =
      beat.kind === "hold"
        ? null
        : {
            eventId: beat.eventId,
            kind: beat.kind,
            chars:
              beat.kind === "type"
                ? charsShown(remaining, beat.chars, beat.durationMs)
                : beat.chars,
            total: beat.chars,
          };
    return {
      done: false,
      beatIndex: i,
      chapterId: beat.chapterId,
      completedIds,
      active,
    };
  }
  return {
    done: true,
    beatIndex: beats.length - 1,
    chapterId: beats[beats.length - 1].chapterId,
    completedIds: beats.filter((beat) => beat.kind !== "hold").map((beat) => beat.eventId),
    active: null,
  };
}

export function eventView(
  event: CommsEvent,
  snap: PlaybackSnapshot,
  idle: boolean,
): EventView {
  if (idle || snap.done) {
    return { show: true, text: event.body, caret: false, complete: true };
  }
  if (snap.completedIds.includes(event.id)) {
    return { show: true, text: event.body, caret: false, complete: true };
  }
  if (snap.active?.eventId === event.id) {
    const text = event.body.slice(0, snap.active.chars);
    const caret =
      snap.active.kind === "type" && snap.active.chars < event.body.length;
    return { show: true, text, caret, complete: false };
  }
  return HIDDEN_VIEW;
}

export function chapterUnlocked(
  chapterId: string,
  snap: PlaybackSnapshot,
  ids: string[] = chapterIds(),
  idle = false,
): boolean {
  if (idle || snap.done) return true;
  const index = ids.indexOf(chapterId);
  const current = ids.indexOf(snap.chapterId);
  if (index < 0 || current < 0) return false;
  return index <= current;
}

export function playbackProgress(
  chapterId: string,
  ids: string[] = chapterIds(),
): number {
  const index = ids.indexOf(chapterId);
  if (index < 0) return 0;
  return index / Math.max(1, ids.length - 1);
}

export function shouldAutoplay(input: {
  reducedMotion: boolean;
  hash: string;
}): boolean {
  if (input.reducedMotion) return false;
  const id = input.hash.replace(/^#/, "");
  return !id || id === "hero";
}

/** Keep the catalog footer off-screen while the reel is lining up chapters. */
export function showSiteFooter(mode: "playing" | "idle"): boolean {
  return mode === "idle";
}

export function isUserScrollKey(key: string): boolean {
  return (
    key === "ArrowDown" ||
    key === "ArrowUp" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "PageDown" ||
    key === "PageUp" ||
    key === "Home" ||
    key === "End" ||
    key === " " ||
    key === "Spacebar"
  );
}

export function isHashNavHref(href: string | null): boolean {
  if (!href) return false;
  return href.startsWith("#");
}

/** True only for a real user flick — not Lenis, not a 0-delta trackpad tick, not boot noise. */
export function shouldInterruptFromWheel(
  deltaX: number,
  deltaY: number,
  input: { programmatic: boolean; playingForMs: number },
): boolean {
  if (input.programmatic) return false;
  if (input.playingForMs < PLAYBACK.interruptGraceMs) return false;
  return Math.hypot(deltaX, deltaY) >= PLAYBACK.interruptWheelPx;
}

export function snapshotChanged(
  prev: PlaybackSnapshot,
  next: PlaybackSnapshot,
): boolean {
  return (
    prev.beatIndex !== next.beatIndex ||
    prev.done !== next.done ||
    prev.chapterId !== next.chapterId ||
    prev.active?.eventId !== next.active?.eventId ||
    prev.active?.chars !== next.active?.chars
  );
}

export type VoiceState = "talking" | "thinking" | "listening";

/** KEI/AOS voice: speaking on TX, thinking on tool/think beats, listening otherwise. */
export function voiceState(snap: PlaybackSnapshot, idle: boolean): VoiceState {
  if (idle || snap.done) return "listening";
  const id = snap.active?.eventId ?? "";
  if (snap.active?.kind === "think") return "thinking";
  if (snap.active?.kind === "type" && id.startsWith("tx-")) return "talking";
  if (id.startsWith("rx-")) return "listening";
  if (snap.active?.kind === "type") return "thinking";
  return "listening";
}

/** When the reel advances, pin the finished chapter to the top — not the incoming one. */
export function pinScrollId(fromChapter: string, toChapter: string): string {
  return fromChapter === toChapter ? toChapter : fromChapter;
}

export type ScrollCue = {
  mode: "follow" | "snap" | "fit";
  selector: string;
};

/** Follow while typing; snap mid-catalog to the listen bar; fit the last chapter in view and stop. */
export function scrollCue(
  prev: PlaybackSnapshot,
  next: PlaybackSnapshot,
): ScrollCue | null {
  const last = chapterIds().at(-1);
  const wasTx = prev.active?.eventId?.startsWith("tx-") === true;
  const isTx = next.active?.eventId?.startsWith("tx-") === true;
  if (isTx) {
    if (next.chapterId === last) return null;
    return { mode: "follow", selector: `#${next.chapterId}-reply` };
  }
  if (wasTx && !isTx) {
    if (prev.chapterId === last) {
      return { mode: "fit", selector: `#${prev.chapterId}-reply` };
    }
    return { mode: "snap", selector: `#${prev.chapterId}-reply` };
  }
  const id = next.active?.eventId ?? "";
  if (id.startsWith("think-") || id.startsWith("tool-")) {
    return { mode: "follow", selector: `#${next.chapterId}` };
  }
  return null;
}

/** Keep the typing edge in view; do not pin to the listen bar (that's snap). */
export function followScrollDelta(
  rect: { top: number; bottom: number },
  viewport: { header: number; footer: number; height: number },
): number {
  const viewTop = viewport.header;
  const viewBottom = viewport.height - viewport.footer;
  if (rect.bottom > viewBottom) {
    return rect.bottom - viewBottom + 12;
  }
  if (rect.top >= viewBottom) {
    return rect.top - viewTop - 36;
  }
  return 0;
}

/** Line the section's bottom up with the bottom of the readable viewport. */
export function snapToBottomDelta(
  rect: { bottom: number },
  viewport: { footer: number; height: number },
): number {
  return rect.bottom - (viewport.height - viewport.footer);
}

/** Lift the last card so its bottom clears the listen bar; do not pin it flush. */
export function fitInViewDelta(
  rect: { top: number; bottom: number },
  viewport: { header: number; footer: number; height: number },
): number {
  const viewTop = viewport.header;
  const viewBottom = viewport.height - viewport.footer;
  if (rect.top >= viewBottom) {
    return rect.top - viewTop;
  }
  if (rect.bottom > viewBottom) {
    return rect.bottom - viewBottom;
  }
  if (rect.top < viewTop) {
    return rect.top - viewTop;
  }
  return 0;
}
