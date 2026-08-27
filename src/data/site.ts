import type { SiteSocial, WorldConfig } from "./types";

export const site = {
  name: "Kunani",
  person: "Kei Sakai",
  domain: "kunani.dev",
  url: "https://kunani.dev",
  handle: "@KeiSakaiX",
  company: "Kunani Gaming",
  tagline: "Worlds, tools, and stages.",
  description:
    "Kei Sakai — Kunani. Game worlds, local AI tools, and real-time 3D stages. MASKCLAW, Dictate Capture, Side Eye, Token Savers, Zork Reborn, CAPTURE! for Quake II, and more.",
  heroLine: "I'm into Video Games, Blockchain, Ai, and faster cars than you.",
  years: "1980s — now",
  location: "Las Vegas",
  githubUser: "budezllc",
  title: "Kunani — Kei Sakai",
  themeColor: "#07090c",
  locale: "en_US",
  ogImage: "/og.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: "image/png",
  ogImageAlt: "Kei Sakai as a Westworld-style host — Kunani",
} as const;

export const share = {
  title: site.title,
  description: site.description,
  url: site.url,
  siteName: site.name,
  type: "website",
  locale: site.locale,
  image: `${site.url}${site.ogImage}`,
  imageWidth: String(site.ogImageWidth),
  imageHeight: String(site.ogImageHeight),
  imageType: site.ogImageType,
  imageAlt: site.ogImageAlt,
  twitterCard: "summary_large_image",
  twitterSite: site.handle,
} as const;

export const socials: SiteSocial[] = [
  { label: "GitHub", href: "https://github.com/budezllc" },
  { label: "X", href: "https://x.com/KeiSakaiX" },
  { label: "YouTube", href: "https://www.youtube.com/@Kunani" },
  { label: "Side Eye", href: "https://getsideeye.com" },
];

export const aboutBlurb = `Destroyer of Donuts. Video game developer. VFX fanboy. Coffee addict. Speed junkie. MOCAP actor. Nigorizake master. Merkle tree-hugger. Token maker. GPU hoarder. Father of females.`;

export const aboutBody = `Forty-plus years across games, tools, and pictures that move. I shipped CAPTURE! — the battle-royale CTF with jail 1-on-1s — into id Software's Extremities netpack, built SUPER SHMUP, ran real-time 3D stream stages that listened to live chat, and now I make local-first AI software you can actually run on your machine: MASKCLAW, Dictate Capture, Side Eye, Token Savers, Jarvis in Cursor, Switchyard on Windows.`;

export const overtureWorld: WorldConfig = {
  kind: "tsuki",
  palette: {
    primary: "#d4c4a8",
    secondary: "#d4b06a",
    accent: "#8a9bb0",
    fog: "#010208",
  },
};

export const codaWorld: WorldConfig = {
  kind: "samurai",
  palette: {
    primary: "#c45c4a",
    secondary: "#d4b06a",
    accent: "#3d5a78",
    fog: "#010208",
  },
};
