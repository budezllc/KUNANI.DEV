import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const html = readFileSync(resolve(process.cwd(), "dist/index.html"), "utf8");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(html.includes("<title>Kunani — Kei Sakai</title>"), "missing live title");
assert(
  html.includes(
    "Kei Sakai — Kunani. Game worlds, local AI tools, and real-time 3D stages. MASKCLAW, Dictate Capture, Side Eye, Token Savers, Zork Reborn, CAPTURE! for Quake II, and more.",
  ),
  "missing unique description",
);
assert(!html.includes('<div id="root"></div>'), "dist/index.html still has an empty #root");
assert(html.includes('<div id="root">'), "missing #root");
assert(html.includes("MASKCLAW"), "missing MASKCLAW");
assert(html.includes("Dictate Capture"), "missing Dictate Capture");
assert(html.indexOf("MASKCLAW") < html.indexOf("Dictate Capture"), "MASKCLAW must stay first");
assert(html.includes("2026"), "missing catalog year 2026");
assert(html.includes("1998"), "missing CAPTURE! year");
assert(html.includes("id=\"ssg-home\""), "missing crawler catalog root");

if (failures.length) {
  console.error("dist/index.html prerender assertion failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(
  "dist/index.html contains MASKCLAW-first catalog titles, years, and the unique description.",
);
