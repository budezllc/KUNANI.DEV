import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { codaWorld, overtureWorld } from "../data/site";
import type { Project } from "../data/types";
import {
  REQUIRED_SLUGS,
  assertCatalog,
  assertProject,
  catalogHref,
  chapterIds,
  featuredProjects,
  getProjectBySlug,
  newestProject,
  projectsByLane,
  scrollWorlds,
} from "./catalog";

describe("catalog", () => {
  it("passes schema validation", () => {
    expect(() => assertCatalog(projects)).not.toThrow();
  });

  it("includes every requested project slug", () => {
    for (const slug of REQUIRED_SLUGS) {
      expect(getProjectBySlug(slug)).toBeDefined();
    }
  });

  it("keeps the newest ship first so catalog jumps land on it", () => {
    expect(projects[0].slug).toBe("maskclaw");
    expect(newestProject().slug).toBe("maskclaw");
    expect(catalogHref()).toBe("#maskclaw");
    expect(catalogHref([{ ...projects[1], slug: "brand-new" }, ...projects])).toBe(
      "#brand-new",
    );
  });

  it("keeps slugs unique and kebab-case", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("exposes featured work including Side Eye, CAPTURE!, Zork, and the virtual stage", () => {
    const featured = featuredProjects().map((project) => project.slug);
    expect(featured).toEqual(
      expect.arrayContaining([
        "maskclaw",
        "dictate-capture",
        "side-eye",
        "capture",
        "zork-reborn",
        "super-shmup",
        "virtual-stage",
      ]),
    );
  });

  it("groups games separately from tools", () => {
    expect(projectsByLane("game").map((p) => p.slug)).toEqual([
      "zork-reborn",
      "super-shmup",
      "capture",
    ]);
    expect(projectsByLane("tool").map((p) => p.slug)).toEqual([
      "dictate-capture",
      "token-savers",
      "cursor-jarvis",
      "switchyard",
    ]);
  });

  it("embeds the stream reel YouTube id", () => {
    const stage = getProjectBySlug("virtual-stage");
    expect(stage?.media).toEqual({
      kind: "youtube",
      id: "4HlekgKyvTA",
      title: "OPPA TITAN STYLE — Kunani virtual stage",
    });
  });

  it("embeds the SUPER SHMUP score-attack reel", () => {
    const shmup = getProjectBySlug("super-shmup");
    expect(shmup?.media).toEqual({
      kind: "youtube",
      id: "AqRvpqR8CFs",
      title: "My SUPER SHMUP Score: 8028",
    });
    expect(shmup?.featured).toBe(true);
  });

  it("shows the Zork Reborn GitHub snapshot on the chapter", () => {
    const zork = getProjectBySlug("zork-reborn");
    expect(zork?.media).toEqual({
      kind: "image",
      src: "/media/zork-reborn.png",
      title: "Zork Reborn — West of House",
    });
  });

  it("links MASKCLAW to the site and repo, with the README hero and four shots", () => {
    const claw = getProjectBySlug("maskclaw");
    expect(claw?.title).toBe("MASKCLAW");
    expect(claw?.featured).toBe(true);
    expect(claw?.openSource).toBe(true);
    expect(claw?.summary).toMatch(/privacy proxy/i);
    expect(claw?.links).toEqual([
      { label: "maskclaw.com", href: "https://maskclaw.com", kind: "live" },
      {
        label: "GitHub",
        href: "https://github.com/budezllc/maskclaw",
        kind: "repo",
      },
    ]);
    expect(claw?.media).toEqual({
      kind: "gallery",
      hero: {
        src: "/media/maskclaw/hero.png",
        title: "MASKCLAW — privacy proxy header",
      },
      shots: [
        { src: "/media/maskclaw/home.png", title: "MASKCLAW — HOME" },
        { src: "/media/maskclaw/masked.png", title: "MASKCLAW — MASKED" },
        { src: "/media/maskclaw/models.png", title: "MASKCLAW — MODELS" },
        { src: "/media/maskclaw/settings.png", title: "MASKCLAW — SETTINGS" },
      ],
    });
  });

  it("rejects a gallery with no shots so MASKCLAW-style entries stay complete", () => {
    const broken = {
      ...projects[0],
      slug: "new-thing",
      media: {
        kind: "gallery" as const,
        hero: { src: "/media/maskclaw/hero.png", title: "Header" },
        shots: [],
      },
    };
    expect(() => assertProject(broken)).toThrow(/at least one shot/);
  });

  it("links Dictate Capture to the public repo", () => {
    const capture = getProjectBySlug("dictate-capture");
    expect(capture?.title).toBe("Dictate Capture");
    expect(capture?.featured).toBe(true);
    expect(capture?.openSource).toBe(true);
    expect(capture?.summary).toMatch(/gold box/i);
    expect(capture?.links).toEqual([
      {
        label: "GitHub",
        href: "https://github.com/budezllc/dictate-capture",
        kind: "repo",
      },
    ]);
  });

  it("shows the getsideeye.com snapshot on the Side Eye chapter", () => {
    const sideEye = getProjectBySlug("side-eye");
    expect(sideEye?.media).toEqual({
      kind: "image",
      src: "/media/side-eye.png",
      title: "Side Eye — getsideeye.com",
    });
  });

  it("shows the Switchyard dashboard snapshot on the chapter", () => {
    const switchyard = getProjectBySlug("switchyard");
    expect(switchyard?.media).toEqual({
      kind: "image",
      src: "/media/switchyard.png",
      title: "Switchyard — Windows tray GUI",
    });
  });

  it("shows the Token Savers GitHub dashboard snapshot on the chapter", () => {
    const savers = getProjectBySlug("token-savers");
    expect(savers?.media).toEqual({
      kind: "image",
      src: "/media/token-savers.png",
      title: "Token Savers — usage dashboard",
    });
  });

  it("describes CAPTURE! as jail 1-on-1 battle-royale CTF with the Extremities citation", () => {
    const capture = getProjectBySlug("capture");
    expect(capture?.title).toBe("CAPTURE!");
    expect(capture?.summary).toMatch(/battle-royale/i);
    expect(capture?.body).toMatch(/1-on-1/);
    expect(capture?.body).toMatch(/jail/i);
    expect(capture?.links.some((link) =>
      link.href.includes("Quake_II_Netpack_I:_Extremities"),
    )).toBe(true);
    expect(capture?.media).toEqual({
      kind: "image",
      src: "/media/capture.png",
      title: "Quake II Netpack I: Extremities",
    });
  });

  it("builds scroll worlds as overture + projects + coda", () => {
    const worlds = scrollWorlds();
    expect(worlds[0]).toEqual(overtureWorld);
    expect(worlds.at(-1)).toEqual(codaWorld);
    expect(worlds).toHaveLength(projects.length + 2);
  });

  it("uses a moon for the hero and a samurai kabuto for about", () => {
    expect(overtureWorld.kind).toBe("tsuki");
    expect(codaWorld.kind).toBe("samurai");
  });

  it("uses hero / project slugs / about as chapter ids", () => {
    expect(chapterIds()).toEqual([
      "hero",
      ...projects.map((project) => project.slug),
      "about",
    ]);
  });

  it("rejects a project missing links so new entries stay complete", () => {
    const broken = {
      ...projects[0],
      slug: "new-thing",
      links: [],
    } as Project;
    expect(() => assertProject(broken)).toThrow(/at least one link/);
  });

  it("rejects a remote image so snapshots stay in public/", () => {
    const broken = {
      ...projects[0],
      slug: "new-thing",
      media: {
        kind: "image" as const,
        src: "https://example.com/shot.png",
        title: "Nope",
      },
    };
    expect(() => assertProject(broken)).toThrow(/invalid image src/);
  });

  it("rejects duplicate slugs so adding a project cannot collide", () => {
    expect(() => assertCatalog([projects[0], projects[0]])).toThrow(
      /duplicate slug/,
    );
  });
});
