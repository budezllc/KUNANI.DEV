# kunani.dev

Portfolio for [Kei Sakai](https://x.com/KeiSakaiX) / Kunani Gaming. The page is a local AI session — model, context window, thinking, tool calls, helmet RX / Jarvis TX.

## Add a project

Open `src/data/projects.ts` and append an entry. That is the whole content pipeline — the session log and the HUD all read from this array.

Required fields:

| Field | Notes |
| --- | --- |
| `slug` | Unique kebab-case id. Becomes `#anchor`. |
| `title`, `kicker`, `summary`, `body` | Copy. |
| `reel` | Demo-reel timecode `HH:MM:SS`. |
| `year` | String (e.g. `1998`, `2026`, `Arcade`). |
| `lane` | `product` \| `tool` \| `game` \| `stage` |
| `openSource` | `true` shows “Open source”. |
| `featured` | Highlighted in catalog helpers. |
| `tags` | At least one. |
| `links` | At least one `{ label, href, kind }`. |
| `world.kind` | Visual for the stage: `tsuki`, `samurai`, `eye`, `gateway`, `voice`, `switch`, `constellation`, `dungeon`, `shmup`, `arena`, `broadcast`. |
| `world.palette` | `#rrggbb` for `primary`, `secondary`, `accent`, `fog`. |
| `media` | Optional `{ kind: "youtube", id, title }` to embed a reel. |

Then run `npm test` — the catalog schema rejects missing links, bad slugs, duplicate ids, and invalid YouTube ids.

## Scripts

```bash
npm install
npm test
npm run dev
npm run build
```

## Deploy

GitHub Pages serves the `gh-pages` branch (Vite `dist/`). Custom domain is `kunani.dev` (`public/CNAME`). Point DNS at GitHub Pages after the first deploy.
