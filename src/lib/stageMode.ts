export type StageMode = "session" | "volume";

/** Default is the AI session HUD. `?stage=volume` restores the parked Three.js stage. */
export function parseStageMode(search: string): StageMode {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(query).get("stage") === "volume"
    ? "volume"
    : "session";
}
