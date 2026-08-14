import { aboutBody, site } from "../data/site";
import { projects } from "../data/projects";
import type { Project } from "../data/types";
import { chapterIds } from "./catalog";
import { blendIndex, clamp, lerp } from "./math";

export const session = {
  os: "KEI/AOS",
  model: "kunani-os",
  provider: "local · uplink dark",
  contextWindow: 128_000,
  baseTokens: 2_400,
  fillRatio: 0.62,
  tools: ["catalog.read", "identity.card", "reel.seek", "github.open"] as const,
};

export type CommsRole = "system" | "rx" | "thinking" | "tool" | "tx";

export type CommsEvent = {
  id: string;
  role: CommsRole;
  channel: string;
  body: string;
  chapterId: string;
};

export type ToolRead = {
  tool: "catalog.read";
  args: { slug: string };
  ok: true;
  data: {
    title: string;
    lane: Project["lane"];
    year: string;
    open_source: boolean;
    tags: string[];
  };
};

export function formatTokens(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

export function contextMeter(
  progress: number,
  windowSize = session.contextWindow,
) {
  const used = Math.round(
    lerp(session.baseTokens, Math.floor(windowSize * session.fillRatio), clamp(progress)),
  );
  return {
    used,
    window: windowSize,
    remaining: windowSize - used,
    pct: used / windowSize,
  };
}

export function toolResult(project: Project): ToolRead {
  return {
    tool: "catalog.read",
    args: { slug: project.slug },
    ok: true,
    data: {
      title: project.title,
      lane: project.lane,
      year: project.year,
      open_source: project.openSource,
      tags: project.tags,
    },
  };
}

export function sessionEvents(list: Project[] = projects): CommsEvent[] {
  const events: CommsEvent[] = [
    {
      id: "boot",
      role: "system",
      channel: "sys/boot",
      body: `${session.os} online · ${session.provider} · ${list.length} tools in catalog`,
      chapterId: "hero",
    },
    {
      id: "rx-hero",
      role: "rx",
      channel: `rx/${site.person}`,
      body: `${session.os}, pull up what I've shipped.`,
      chapterId: "hero",
    },
    {
      id: "think-hero",
      role: "thinking",
      channel: "think",
      body: `catalog.list() · ${list.length} artifacts · weights local`,
      chapterId: "hero",
    },
    {
      id: "tx-hero",
      role: "tx",
      channel: `tx/${session.os}`,
      body: site.heroLine,
      chapterId: "hero",
    },
  ];

  for (const project of list) {
    const read = toolResult(project);
    events.push(
      {
        id: `think-${project.slug}`,
        role: "thinking",
        channel: "think",
        body: `load ${project.slug} into working memory`,
        chapterId: project.slug,
      },
      {
        id: `tool-${project.slug}`,
        role: "tool",
        channel: `tool/${read.tool}`,
        body: `${read.tool}(${JSON.stringify(read.args)})`,
        chapterId: project.slug,
      },
      {
        id: `tx-${project.slug}`,
        role: "tx",
        channel: `tx/${session.os}`,
        body: project.summary,
        chapterId: project.slug,
      },
    );
  }

  events.push(
    {
      id: "think-about",
      role: "thinking",
      channel: "think",
      body: "identity.card() · operator dossier",
      chapterId: "about",
    },
    {
      id: "tool-about",
      role: "tool",
      channel: "tool/identity.card",
      body: `identity.card(${JSON.stringify({ handle: site.handle, loc: site.location })})`,
      chapterId: "about",
    },
    {
      id: "tx-about",
      role: "tx",
      channel: `tx/${session.os}`,
      body: aboutBody,
      chapterId: "about",
    },
  );

  return events;
}

export function activeChapterId(
  progress: number,
  ids: string[] = chapterIds(),
): string {
  const { index, next, mix } = blendIndex(progress, ids.length);
  return mix >= 0.5 ? ids[next] : ids[index];
}

export function commsWindow(
  chapterId: string,
  events: CommsEvent[],
  limit = 10,
): CommsEvent[] {
  const last = events.findLastIndex((event) => event.chapterId === chapterId);
  const end = last === -1 ? events.length : last + 1;
  return events.slice(Math.max(0, end - limit), end);
}
