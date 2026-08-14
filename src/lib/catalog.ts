import type { Project, WorldConfig } from "../data/types";
import { codaWorld, overtureWorld } from "../data/site";
import { projects } from "../data/projects";
import { isLocalImageSrc } from "./media";

const HEX = /^#([0-9a-fA-F]{6})$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REEL = /^\d{2}:\d{2}:\d{2}$/;

const LANES = new Set(["product", "tool", "game", "stage"]);
const KINDS = new Set([
  "tsuki",
  "samurai",
  "eye",
  "gateway",
  "voice",
  "switch",
  "constellation",
  "dungeon",
  "shmup",
  "arena",
  "broadcast",
]);
const LINK_KINDS = new Set(["live", "repo", "store", "docs", "video", "archive"]);

export const REQUIRED_SLUGS = [
  "side-eye",
  "zork-reborn",
  "cursor-jarvis",
  "os-taxonomy",
  "token-savers",
  "switchyard",
  "capture",
  "super-shmup",
  "virtual-stage",
] as const;

export function isHexColor(value: string): boolean {
  return HEX.test(value);
}

export function assertProject(project: Project, index = 0): void {
  const where = `projects[${index}] (${project.slug ?? "?"})`;
  if (!SLUG.test(project.slug)) {
    throw new Error(`${where}: slug must be kebab-case`);
  }
  if (!project.title.trim()) throw new Error(`${where}: title required`);
  if (!project.kicker.trim()) throw new Error(`${where}: kicker required`);
  if (!REEL.test(project.reel)) {
    throw new Error(`${where}: reel must be HH:MM:SS`);
  }
  if (!project.year.trim()) throw new Error(`${where}: year required`);
  if (!LANES.has(project.lane)) throw new Error(`${where}: invalid lane`);
  if (!project.summary.trim()) throw new Error(`${where}: summary required`);
  if (!project.body.trim()) throw new Error(`${where}: body required`);
  if (!project.tags.length) throw new Error(`${where}: at least one tag`);
  if (!project.links.length) throw new Error(`${where}: at least one link`);
  for (const link of project.links) {
    if (!LINK_KINDS.has(link.kind)) {
      throw new Error(`${where}: invalid link kind ${link.kind}`);
    }
    let url: URL;
    try {
      url = new URL(link.href);
    } catch {
      throw new Error(`${where}: invalid href ${link.href}`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`${where}: href must be http(s)`);
    }
  }
  assertWorld(project.world, where);
  if (project.media) {
    if (project.media.kind === "youtube") {
      if (!/^[A-Za-z0-9_-]{11}$/.test(project.media.id)) {
        throw new Error(`${where}: invalid YouTube id`);
      }
    } else if (project.media.kind === "image") {
      if (!isLocalImageSrc(project.media.src)) {
        throw new Error(`${where}: invalid image src`);
      }
      if (!project.media.title.trim()) {
        throw new Error(`${where}: image title required`);
      }
    } else {
      throw new Error(`${where}: unsupported media kind`);
    }
  }
}

export function assertWorld(world: WorldConfig, where = "world"): void {
  if (!KINDS.has(world.kind)) throw new Error(`${where}: invalid world kind`);
  const { palette } = world;
  for (const key of ["primary", "secondary", "accent", "fog"] as const) {
    if (!isHexColor(palette[key])) {
      throw new Error(`${where}: palette.${key} must be #rrggbb`);
    }
  }
}

export function assertCatalog(list: Project[]): void {
  if (!list.length) throw new Error("catalog is empty");
  const slugs = new Set<string>();
  list.forEach((project, index) => {
    assertProject(project, index);
    if (slugs.has(project.slug)) {
      throw new Error(`duplicate slug: ${project.slug}`);
    }
    slugs.add(project.slug);
  });
  for (const slug of REQUIRED_SLUGS) {
    if (!slugs.has(slug)) {
      throw new Error(`missing required project: ${slug}`);
    }
  }
}

export function getProjectBySlug(
  slug: string,
  list: Project[] = projects,
): Project | undefined {
  return list.find((project) => project.slug === slug);
}

export function featuredProjects(list: Project[] = projects): Project[] {
  return list.filter((project) => project.featured);
}

export function projectsByLane(
  lane: Project["lane"],
  list: Project[] = projects,
): Project[] {
  return list.filter((project) => project.lane === lane);
}

export function scrollWorlds(list: Project[] = projects): WorldConfig[] {
  return [overtureWorld, ...list.map((project) => project.world), codaWorld];
}

export function chapterIds(list: Project[] = projects): string[] {
  return ["hero", ...list.map((project) => project.slug), "about"];
}
