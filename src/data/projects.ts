import type { Project } from "./types";

/**
 * Portfolio catalog.
 *
 * Add a new project: copy an entry, give it a unique `slug`, fill copy/links,
 * and pick a `world.kind` (used if the parked Three.js stage is restored).
 * Order in this array is the scroll order after the hero.
 * Prepend new ships so the newest work is always first.
 */
export const projects: Project[] = [
  {
    slug: "dictate-capture",
    title: "Dictate Capture",
    kicker: "Tool · Windows",
    reel: "00:03:40",
    year: "2026",
    lane: "tool",
    openSource: true,
    featured: true,
    summary:
      "Hold a shortcut to talk into Grok Bot or Cursor. Drag a gold box while you hold, and the screenshot lands in chat with your words.",
    body: "Background tray helpers for Windows: hold Ctrl+D in Grok Bot or Ctrl+M in Cursor to dictate. While the keys are down you can drag a gold box around any screen; let go and the transcript plus the crop paste into the chat box — you hit Enter when it looks right. Installs per-user, starts at login, optional Stream Deck buttons. Nothing is uploaded.",
    tags: ["Windows", "dictate", "Grok Bot", "Cursor", "screenshot"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/budezllc/dictate-capture",
        kind: "repo",
      },
    ],
    world: {
      kind: "voice",
      palette: {
        primary: "#d4b06a",
        secondary: "#8fb8b0",
        accent: "#e56b3c",
        fog: "#14100c",
      },
    },
  },
  {
    slug: "side-eye",
    title: "Side Eye",
    kicker: "Product · Chrome",
    reel: "00:08:12",
    year: "2026",
    lane: "product",
    openSource: false,
    featured: true,
    summary:
      "Local AI in Chrome’s side panel. Gemma 4 on-device via LiteRT-LM, or your own LM Studio / Ollama stack.",
    body: "Side Eye sits beside the tab you’re on. Chat with Gemma 4 in the browser through WebGPU — no server — or stream from LM Studio and Ollama on the machine. Page context is optional. Banking domains stay unread. Chats never hit our servers. Optional on-device voice if you want the panel to speak.",
    tags: ["LiteRT-LM", "Gemma 4", "WebGPU", "Chrome", "privacy"],
    links: [
      { label: "getsideeye.com", href: "https://getsideeye.com", kind: "live" },
      {
        label: "Docs",
        href: "https://github.com/budezllc/side-eye-docs",
        kind: "docs",
      },
    ],
    media: {
      kind: "image",
      src: "/media/side-eye.png",
      title: "Side Eye — getsideeye.com",
    },
    world: {
      kind: "eye",
      palette: {
        primary: "#8fb8b0",
        secondary: "#3d5a78",
        accent: "#d4b06a",
        fog: "#0c141c",
      },
    },
  },
  {
    slug: "token-savers",
    title: "Token Savers",
    kicker: "Gateway · Local",
    reel: "00:14:40",
    year: "2026",
    lane: "tool",
    openSource: true,
    featured: true,
    summary:
      "OpenAI-compatible local gateway that shrinks prompts before they’re billed — Clip, Prune, Crush, and a dozen other savers.",
    body: "Sits between Cursor, Cline, Continue, or anything that speaks /v1/chat/completions and your upstream (OpenRouter, OpenAI, Ollama, LM Studio). A pure TypeScript pipeline compresses history, tool dumps, diffs, and HTML chrome in-process. Windows tray app plus a dashboard that shows what actually got saved.",
    tags: ["OpenAI-compatible", "Electron", "Windows", "proxy"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/budezllc/token-savers",
        kind: "repo",
      },
    ],
    media: {
      kind: "image",
      src: "/media/token-savers.png",
      title: "Token Savers — usage dashboard",
    },
    world: {
      kind: "gateway",
      palette: {
        primary: "#6b8f71",
        secondary: "#d4b06a",
        accent: "#e56b3c",
        fog: "#0c1414",
      },
    },
  },
  {
    slug: "cursor-jarvis",
    title: "Cursor Jarvis",
    kicker: "Plugin · Windows",
    reel: "00:19:05",
    year: "2026",
    lane: "tool",
    openSource: true,
    featured: false,
    summary:
      "Cursor agent replies, spoken in a British Jarvis voice. Briefings, not essays.",
    body: "A Cursor plugin that hooks afterAgentResponse, waits for the stream to settle, then speaks a short summary — first three sentences — through edge-tts (en-GB-RyanNeural). Debounced, deduped, and capped so you hear a briefing instead of a markdown novel.",
    tags: ["Cursor", "TTS", "PowerShell", "Windows"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/budezllc/cursor-jarvis-tts",
        kind: "repo",
      },
    ],
    world: {
      kind: "voice",
      palette: {
        primary: "#d4b06a",
        secondary: "#e4c9a0",
        accent: "#3d5a78",
        fog: "#14140c",
      },
    },
  },
  {
    slug: "switchyard",
    title: "Switchyard",
    kicker: "Desktop · Windows",
    reel: "00:23:18",
    year: "2026",
    lane: "tool",
    openSource: true,
    featured: false,
    summary:
      "Windows tray GUI that bundles switchyard-server — LLM traffic routing in a native shell.",
    body: "A standalone Tauri app for Windows: tray, window, and a bundled switchyard-server so coding agents and API clients can route and translate OpenAI, Responses, and Anthropic traffic without babysitting a terminal. One double-click instead of a cargo install.",
    tags: ["Tauri", "Rust", "LLM routing", "Windows"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/budezllc/Switchyard-Windows-GUI",
        kind: "repo",
      },
    ],
    media: {
      kind: "image",
      src: "/media/switchyard.png",
      title: "Switchyard — Windows tray GUI",
    },
    world: {
      kind: "switch",
      palette: {
        primary: "#c45c4a",
        secondary: "#3d5a78",
        accent: "#d4b06a",
        fog: "#141018",
      },
    },
  },
  {
    slug: "os-taxonomy",
    title: "Micro Lessons",
    kicker: "Education · Web",
    reel: "00:28:44",
    year: "2026",
    lane: "product",
    openSource: true,
    featured: false,
    summary:
      "AI micro-lessons on Marble’s open skill taxonomy — 1,590 topics, in learning order, personalized for a kid.",
    body: "A static learning site on the Marble Skill Taxonomy: age-ordered paths, hard prerequisites, read-aloud tutorials, and quizzes. Locally, an OpenAI-compatible agent writes lessons that use a child’s name, pets, and interests. The public GitHub Pages build ships standard lessons only — personalization never leaves the house.",
    tags: ["education", "taxonomy", "local LLM", "kids"],
    links: [
      {
        label: "Live site",
        href: "https://budezllc.github.io/os-taxonomy/",
        kind: "live",
      },
      {
        label: "GitHub",
        href: "https://github.com/budezllc/os-taxonomy",
        kind: "repo",
      },
    ],
    world: {
      kind: "constellation",
      palette: {
        primary: "#8fb8b0",
        secondary: "#d4b06a",
        accent: "#c45c6a",
        fog: "#0c1414",
      },
    },
  },
  {
    slug: "zork-reborn",
    title: "Zork Reborn",
    kicker: "Game · Browser",
    reel: "00:36:02",
    year: "2026",
    lane: "game",
    openSource: true,
    featured: true,
    summary:
      "Zork I in the browser, grounded in Infocom’s ZIL sources — with an optional MiniMax narrator and scene visuals.",
    body: "A remake that starts from the original implementors’ work, not a paraphrase. Type into the Great Underground Empire in a modern client. Optional MiniMax narration and generated scene stills sit on top of the parser world without replacing it. West of house. You are standing in an open field…",
    tags: ["ZIL", "Infocom", "MiniMax", "interactive fiction"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/budezllc/zork-reborn",
        kind: "repo",
      },
    ],
    media: {
      kind: "image",
      src: "/media/zork-reborn.png",
      title: "Zork Reborn — West of House",
    },
    world: {
      kind: "dungeon",
      palette: {
        primary: "#c4a574",
        secondary: "#6b8f71",
        accent: "#c45c4a",
        fog: "#12100c",
      },
    },
  },
  {
    slug: "super-shmup",
    title: "SUPER SHMUP",
    kicker: "Game · Arcade",
    reel: "00:40:22",
    year: "—",
    lane: "game",
    openSource: false,
    featured: true,
    summary:
      "A shoot ’em up built for pattern-reading and score-chasing. The reel is a run that lands on 8028.",
    body: "SUPER SHMUP is a bullet-hell score attack: one ship, a screen full of patterns, no continue screen that matters except the number at the end. The footage below is a full run from Kunani’s channel — final score 8028.",
    tags: ["shmup", "arcade", "score attack"],
    links: [
      {
        label: "Watch the run",
        href: "https://youtu.be/AqRvpqR8CFs",
        kind: "video",
      },
    ],
    media: {
      kind: "youtube",
      id: "AqRvpqR8CFs",
      title: "My SUPER SHMUP Score: 8028",
    },
    world: {
      kind: "shmup",
      palette: {
        primary: "#e56b3c",
        secondary: "#c45c6a",
        accent: "#d4b06a",
        fog: "#120c14",
      },
    },
  },
  {
    slug: "capture",
    title: "CAPTURE!",
    kicker: "Game · Quake II",
    reel: "00:46:10",
    year: "1998",
    lane: "game",
    openSource: false,
    featured: true,
    summary:
      "The original battle-royale capture the flag: win a 1-on-1 in jail to get back in, while two teams fight for glory. Shipped in id Software’s Extremities netpack.",
    body: "CAPTURE! was a full Quake II conversion with a battle-royale twist on CTF. Die and you go to jail. The only way out is a 1-on-1 fight — win it, and you’re released back into the match, where two teams are still running flags for glory. Ten maps (q2cap01–10). id Software and Activision put it on Quake II Netpack I: Extremities in 1998, next to Action Quake 2, Rocket Arena, and Jail Break.",
    tags: ["Quake II", "id Software", "Extremities", "CTF", "battle royale"],
    links: [
      {
        label: "Extremities",
        href: "https://quake.fandom.com/wiki/Quake_II_Netpack_I:_Extremities",
        kind: "archive",
      },
      {
        label: "PlanetQuake mirror",
        href: "https://ftpmirror1.infania.net/pub/PlanetQuake/kunani/",
        kind: "archive",
      },
    ],
    media: {
      kind: "image",
      src: "/media/capture.png",
      title: "Quake II Netpack I: Extremities",
    },
    world: {
      kind: "arena",
      palette: {
        primary: "#c45c4a",
        secondary: "#d4b06a",
        accent: "#8a2a2a",
        fog: "#140c0c",
      },
    },
  },
  {
    slug: "virtual-stage",
    title: "Virtual Stage",
    kicker: "Broadcast · Realtime 3D",
    reel: "00:54:00",
    year: "2010s",
    lane: "stage",
    openSource: false,
    featured: true,
    summary:
      "Twitch software that built real 3D stream backdrops — live chat walked into the set, not a sidebar overlay.",
    body: "A virtual production toy before that was a product category: a 3D stage for the stream, with chat as geometry and motion in the room. Messages arrived, spawned, and played through the backdrop in realtime. The reel below is Oppa Titan Style — the set, live.",
    tags: ["Twitch", "realtime 3D", "chat", "VFX"],
    links: [
      {
        label: "Watch the reel",
        href: "https://youtu.be/4HlekgKyvTA",
        kind: "video",
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/@Kunani",
        kind: "live",
      },
    ],
    media: {
      kind: "youtube",
      id: "4HlekgKyvTA",
      title: "OPPA TITAN STYLE — Kunani virtual stage",
    },
    world: {
      kind: "broadcast",
      palette: {
        primary: "#c45c6a",
        secondary: "#3d5a78",
        accent: "#d4b06a",
        fog: "#121018",
      },
    },
  },
];
