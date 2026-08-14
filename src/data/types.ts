export type ProjectLane = "product" | "tool" | "game" | "stage";

export type WorldKind =
  | "tsuki"
  | "samurai"
  | "eye"
  | "gateway"
  | "voice"
  | "switch"
  | "constellation"
  | "dungeon"
  | "shmup"
  | "arena"
  | "broadcast";

export type LinkKind = "live" | "repo" | "store" | "docs" | "video" | "archive";

export type ProjectLink = {
  label: string;
  href: string;
  kind: LinkKind;
};

export type WorldPalette = {
  primary: string;
  secondary: string;
  accent: string;
  fog: string;
};

export type WorldConfig = {
  kind: WorldKind;
  palette: WorldPalette;
};

export type ProjectMedia =
  | {
      kind: "youtube";
      id: string;
      title: string;
    }
  | {
      kind: "image";
      src: string;
      title: string;
    };

export type Project = {
  /** URL fragment and unique id. kebab-case. */
  slug: string;
  title: string;
  /** Small HUD label above the title. */
  kicker: string;
  /** Demo-reel timecode for this chapter. */
  reel: string;
  year: string;
  lane: ProjectLane;
  openSource: boolean;
  featured: boolean;
  summary: string;
  body: string;
  tags: string[];
  links: ProjectLink[];
  world: WorldConfig;
  media?: ProjectMedia;
};

export type SiteSocial = {
  label: string;
  href: string;
};
