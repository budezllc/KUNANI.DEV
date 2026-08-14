import { describe, expect, it } from "vitest";
import { parseStageMode } from "./stageMode";
import { projects } from "../data/projects";
import { site } from "../data/site";
import {
  activeChapterId,
  commsWindow,
  contextMeter,
  formatTokens,
  session,
  sessionEvents,
  toolResult,
} from "./session";
import { chapterIds } from "./catalog";

describe("stage mode", () => {
  it("defaults to the AI session HUD", () => {
    expect(parseStageMode("")).toBe("session");
    expect(parseStageMode("?foo=1")).toBe("session");
  });

  it("restores the parked Three.js volume with ?stage=volume", () => {
    expect(parseStageMode("?stage=volume")).toBe("volume");
    expect(parseStageMode("stage=volume")).toBe("volume");
  });
});

describe("session", () => {
  it("keeps context under the window as the reel fills", () => {
    const start = contextMeter(0);
    const end = contextMeter(1);
    expect(start.used).toBe(session.baseTokens);
    expect(end.used).toBe(Math.floor(session.contextWindow * session.fillRatio));
    expect(end.used).toBeLessThan(session.contextWindow);
    expect(end.remaining).toBeGreaterThan(0);
    expect(start.pct).toBeLessThan(end.pct);
  });

  it("formats token counts for the HUD", () => {
    expect(formatTokens(2418)).toBe("2,418");
    expect(formatTokens(128000)).toBe("128,000");
  });

  it("turns every catalog entry into a tool read", () => {
    for (const project of projects) {
      const read = toolResult(project);
      expect(read.tool).toBe("catalog.read");
      expect(read.ok).toBe(true);
      expect(read.args.slug).toBe(project.slug);
      expect(read.data.title).toBe(project.title);
      expect(read.data.lane).toBe(project.lane);
    }
  });

  it("builds a comms log with Kei Sakai RX, thinking, tools, and KEI/AOS TX", () => {
    const events = sessionEvents();
    const ids = chapterIds();
    expect(events.some((event) => event.role === "rx" && event.channel === `rx/${site.person}`)).toBe(
      true,
    );
    expect(events.some((event) => event.role === "thinking")).toBe(true);
    expect(events.filter((event) => event.role === "tool")).toHaveLength(projects.length + 1);
    for (const project of projects) {
      expect(events.some((event) => event.chapterId === project.slug)).toBe(true);
    }
    expect(commsWindow("hero", events)[0]?.chapterId).toBe("hero");
    expect(commsWindow("about", events).some((event) => event.chapterId === "about")).toBe(
      true,
    );
    expect(activeChapterId(0, ids)).toBe("hero");
    expect(activeChapterId(1, ids)).toBe("about");
    expect(activeChapterId(0.99, ids)).toBe("about");
    expect(session.os).toBe("KEI/AOS");
    expect(events.find((event) => event.id === "rx-hero")?.body).toBe(
      "KEI/AOS, pull up what I've shipped.",
    );
    expect(events.filter((event) => event.role === "tx").every((event) => event.channel === "tx/KEI/AOS")).toBe(
      true,
    );
    expect(session.model).toContain("kunani");
    expect(session.tools).toContain("catalog.read");
    expect(site.heroLine.length).toBeGreaterThan(10);
  });
});
