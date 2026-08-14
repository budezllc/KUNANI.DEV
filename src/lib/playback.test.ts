import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { chapterIds } from "./catalog";
import {
  PLAYBACK,
  buildTimeline,
  chapterUnlocked,
  charsShown,
  eventView,
  isHashNavHref,
  isUserScrollKey,
  pinScrollId,
  followScrollDelta,
  playbackAt,
  playbackProgress,
  scrollCue,
  snapToBottomDelta,
  fitInViewDelta,
  shouldAutoplay,
  shouldInterruptFromWheel,
  showSiteFooter,
  totalDuration,
  typeDuration,
  voiceState,
} from "./playback";
import { PlaybackProvider, usePlayback } from "../hooks/useSessionPlayback";
import { sessionEvents } from "./session";

describe("playback clock", () => {
  const events = sessionEvents();
  const beats = buildTimeline(events);
  const ids = chapterIds();

  it("builds a beat for every comms event plus a hold at each chapter end", () => {
    expect(beats.filter((beat) => beat.kind !== "hold")).toHaveLength(events.length);
    expect(beats.filter((beat) => beat.kind === "hold")).toHaveLength(ids.length);
    expect(beats.some((beat) => beat.kind === "type")).toBe(true);
    expect(beats.some((beat) => beat.kind === "think")).toBe(true);
  });

  it("caps typed lines so a long reply does not stall the reel", () => {
    expect(typeDuration(8)).toBe(PLAYBACK.minTypeMs);
    expect(typeDuration(10_000)).toBe(PLAYBACK.maxTypeMs);
    expect(charsShown(0, 100, 1000)).toBe(0);
    expect(charsShown(1000, 100, 1000)).toBe(100);
    expect(charsShown(500, 100, 1000)).toBe(50);
  });

  it("starts on the hero boot with later catalog locked", () => {
    const snap = playbackAt(0, beats);
    expect(snap.done).toBe(false);
    expect(snap.chapterId).toBe("hero");
    expect(snap.completedIds).toEqual([]);
    expect(chapterUnlocked("hero", snap, ids, false)).toBe(true);
    expect(chapterUnlocked("side-eye", snap, ids, false)).toBe(false);
    const rx = events.find((event) => event.id === "rx-hero");
    expect(rx).toBeDefined();
    expect(eventView(rx!, snap, false).show).toBe(false);
  });

  it("types Kei Sakai's command before KEI/AOS answers", () => {
    const boot = beats[0];
    const rxBeat = beats[1];
    const snap = playbackAt(boot.durationMs + rxBeat.durationMs / 2, beats);
    expect(snap.active?.eventId).toBe("rx-hero");
    expect(snap.active?.kind).toBe("type");
    expect(snap.active!.chars).toBeGreaterThan(0);
    expect(snap.active!.chars).toBeLessThan(rxBeat.chars);
    const rx = events.find((event) => event.id === "rx-hero")!;
    const view = eventView(rx, snap, false);
    expect(view.show).toBe(true);
    expect(view.caret).toBe(true);
    expect(view.text.length).toBe(snap.active!.chars);
    expect(eventView(events.find((event) => event.id === "tx-hero")!, snap, false).show).toBe(
      false,
    );
  });

  it("pins the finished chapter to the top when the reel advances", () => {
    expect(pinScrollId("hero", "side-eye")).toBe("hero");
    expect(pinScrollId("side-eye", "token-savers")).toBe("side-eye");
    expect(pinScrollId("about", "about")).toBe("about");
  });

  it("follows the reply while it types, then snaps it to the viewport bottom when TX finishes", () => {
    let elapsed = 0;
    for (const beat of beats) {
      if (beat.eventId === "tx-hero") break;
      elapsed += beat.durationMs;
    }
    const txBeat = beats.find((beat) => beat.eventId === "tx-hero")!;
    const beforeTx = playbackAt(Math.max(0, elapsed - 1), beats);
    const txSnap = playbackAt(elapsed + 40, beats);
    const stillTyping = playbackAt(elapsed + 80, beats);
    expect(txSnap.active?.eventId).toBe("tx-hero");
    expect(scrollCue(beforeTx, txSnap)).toEqual({
      mode: "follow",
      selector: "#hero-reply",
    });
    expect(scrollCue(txSnap, stillTyping)).toEqual({
      mode: "follow",
      selector: "#hero-reply",
    });

    const holdSnap = playbackAt(elapsed + txBeat.durationMs, beats);
    expect(holdSnap.active).toBeNull();
    expect(holdSnap.chapterId).toBe("hero");
    expect(scrollCue(txSnap, holdSnap)).toEqual({
      mode: "snap",
      selector: "#hero-reply",
    });

    const sideIndex = beats.findIndex((beat) => beat.chapterId === "side-eye");
    elapsed = 0;
    for (let i = 0; i < sideIndex; i += 1) elapsed += beats[i].durationMs;
    const leavingHero = playbackAt(elapsed - 1, beats);
    const enteringSide = playbackAt(elapsed, beats);
    expect(leavingHero.chapterId).toBe("hero");
    expect(enteringSide.chapterId).toBe("side-eye");
    expect(enteringSide.active?.eventId).toBe("think-side-eye");
    expect(scrollCue(leavingHero, enteringSide)).toEqual({
      mode: "follow",
      selector: "#side-eye",
    });

    elapsed = 0;
    for (const beat of beats) {
      if (beat.eventId === "tx-zork-reborn") break;
      elapsed += beat.durationMs;
    }
    const zorkBeat = beats.find((beat) => beat.eventId === "tx-zork-reborn")!;
    const beforeZork = playbackAt(elapsed - 1, beats);
    const zorkTx = playbackAt(elapsed + 40, beats);
    expect(zorkTx.active?.eventId).toBe("tx-zork-reborn");
    expect(scrollCue(beforeZork, zorkTx)).toEqual({
      mode: "follow",
      selector: "#zork-reborn-reply",
    });
    expect(scrollCue(zorkTx, playbackAt(elapsed + zorkBeat.durationMs, beats))).toEqual({
      mode: "snap",
      selector: "#zork-reborn-reply",
    });

    elapsed = 0;
    for (const beat of beats) {
      if (beat.eventId === "tx-about") break;
      elapsed += beat.durationMs;
    }
    const aboutBeat = beats.find((beat) => beat.eventId === "tx-about")!;
    const aboutTx = playbackAt(elapsed + 40, beats);
    expect(chapterIds().at(-1)).toBe("about");
    expect(aboutTx.active?.eventId).toBe("tx-about");
    expect(scrollCue(playbackAt(elapsed - 1, beats), aboutTx)).toBeNull();
    expect(scrollCue(aboutTx, playbackAt(elapsed + aboutBeat.durationMs, beats))).toEqual({
      mode: "fit",
      selector: "#about-reply",
    });
  });

  it("nudges scroll just enough to keep a clipped section in view", () => {
    const viewport = { header: 72, footer: 64, height: 700 };
    expect(
      followScrollDelta({ top: 800, bottom: 1100 }, viewport),
    ).toBe(1100 - (700 - 64) + 12);
    expect(followScrollDelta({ top: 120, bottom: 400 }, viewport)).toBe(0);
    expect(followScrollDelta({ top: 636, bottom: 636 }, viewport)).toBe(636 - 72 - 36);
  });

  it("lines a finished section up so its bottom sits on the listen bar", () => {
    const viewport = { footer: PLAYBACK.snapFooterPx, height: 700 };
    expect(snapToBottomDelta({ bottom: 800 }, viewport)).toBe(
      800 - (700 - PLAYBACK.snapFooterPx),
    );
    expect(snapToBottomDelta({ bottom: 700 - PLAYBACK.snapFooterPx }, viewport)).toBe(0);
    expect(snapToBottomDelta({ bottom: 400 }, viewport)).toBe(
      400 - (700 - PLAYBACK.snapFooterPx),
    );
  });

  it("lifts the last card so socials clear the listen bar", () => {
    const viewport = {
      header: PLAYBACK.headerPx,
      footer: PLAYBACK.fitFooterPx,
      height: 900,
    };
    const viewBottom = 900 - PLAYBACK.fitFooterPx;
    expect(fitInViewDelta({ top: 180, bottom: viewBottom - 40 }, viewport)).toBe(
      0,
    );
    expect(fitInViewDelta({ top: 180, bottom: 880 }, viewport)).toBe(
      880 - viewBottom,
    );
    expect(PLAYBACK.fitFooterPx).toBeGreaterThan(PLAYBACK.snapFooterPx);
    expect(fitInViewDelta({ top: 40, bottom: 520 }, viewport)).toBe(
      40 - PLAYBACK.headerPx,
    );
    expect(fitInViewDelta({ top: 940, bottom: 1280 }, viewport)).toBe(
      940 - PLAYBACK.headerPx,
    );
  });

  it("holds a couple extra seconds on a finished section before the next think", () => {
    expect(PLAYBACK.holdMs).toBe(2400);
    expect(beats.find((beat) => beat.kind === "hold")?.durationMs).toBe(2400);
  });

  it("drives KEI/AOS voice from thinking and TX beats", () => {
    const boot = playbackAt(0, beats);
    expect(voiceState(boot, false)).toBe("listening");
    const thinkAt = beats.find((beat) => beat.eventId === "think-hero")!;
    let elapsed = 0;
    for (const beat of beats) {
      if (beat.eventId === "think-hero") break;
      elapsed += beat.durationMs;
    }
    const thinking = playbackAt(elapsed + thinkAt.durationMs / 2, beats);
    expect(voiceState(thinking, false)).toBe("thinking");
    elapsed = 0;
    for (const beat of beats) {
      if (beat.eventId === "tx-hero") break;
      elapsed += beat.durationMs;
    }
    const talking = playbackAt(elapsed + 80, beats);
    expect(talking.active?.eventId).toBe("tx-hero");
    expect(voiceState(talking, false)).toBe("talking");
    expect(voiceState(talking, true)).toBe("listening");
  });

  it("unlocks the next project after the hero hold and keeps later chapters queued", () => {
    let elapsed = 0;
    const sideEyeIndex = beats.findIndex((beat) => beat.chapterId === "side-eye");
    for (let i = 0; i < sideEyeIndex; i += 1) elapsed += beats[i].durationMs;
    const snap = playbackAt(elapsed, beats);
    expect(snap.chapterId).toBe("side-eye");
    expect(chapterUnlocked("side-eye", snap, ids, false)).toBe(true);
    expect(chapterUnlocked("about", snap, ids, false)).toBe(false);
    expect(chapterUnlocked("about", snap, ids, true)).toBe(true);
  });

  it("finishes with every event complete", () => {
    const snap = playbackAt(totalDuration(beats), beats);
    expect(snap.done).toBe(true);
    expect(snap.chapterId).toBe("about");
    expect(snap.completedIds).toContain("tx-about");
    expect(snap.completedIds).toHaveLength(events.length);
    const last = events[events.length - 1];
    expect(eventView(last, snap, false)).toEqual({
      show: true,
      text: last.body,
      caret: false,
      complete: true,
    });
  });

  it("autoplays on first load unless the visitor already picked a section", () => {
    expect(shouldAutoplay({ reducedMotion: false, hash: "" })).toBe(true);
    expect(shouldAutoplay({ reducedMotion: false, hash: "#" })).toBe(true);
    expect(shouldAutoplay({ reducedMotion: false, hash: "#hero" })).toBe(true);
    expect(shouldAutoplay({ reducedMotion: false, hash: "#side-eye" })).toBe(false);
    expect(shouldAutoplay({ reducedMotion: true, hash: "" })).toBe(false);
    expect(showSiteFooter("playing")).toBe(false);
    expect(showSiteFooter("idle")).toBe(true);
    expect(isUserScrollKey("ArrowDown")).toBe(true);
    expect(isUserScrollKey("a")).toBe(false);
    expect(isHashNavHref("#about")).toBe(true);
    expect(isHashNavHref("https://github.com/budezllc")).toBe(false);
    expect(playbackProgress("hero", ids)).toBe(0);
    expect(playbackProgress("about", ids)).toBe(1);
    expect(shouldInterruptFromWheel(0, 0, { programmatic: false, playingForMs: 5_000 })).toBe(
      false,
    );
    expect(shouldInterruptFromWheel(0, 80, { programmatic: true, playingForMs: 5_000 })).toBe(
      false,
    );
    expect(shouldInterruptFromWheel(0, 80, { programmatic: false, playingForMs: 100 })).toBe(
      false,
    );
    expect(shouldInterruptFromWheel(0, 80, { programmatic: false, playingForMs: 2_000 })).toBe(
      true,
    );
    expect(typeof PlaybackProvider).toBe("function");
    expect(typeof usePlayback).toBe("function");
    expect(projects.length).toBeGreaterThan(0);
  });
});
