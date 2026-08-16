import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { share, site } from "./site";

const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

function meta(attr: "name" | "property", key: string): string | undefined {
  const pattern = new RegExp(
    `<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`,
  );
  const wrapped = new RegExp(
    `<meta\\s+${attr}="${key}"\\s+content="([^"]*)"\\s*/>`,
  );
  return html.match(pattern)?.[1] ?? html.match(wrapped)?.[1];
}

function metaMultiline(attr: "name" | "property", key: string): string | undefined {
  const pattern = new RegExp(
    `<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`,
    "s",
  );
  return html.match(pattern)?.[1];
}

describe("share tags", () => {
  it("exposes absolute Open Graph and Twitter card fields scrapers need", () => {
    expect(share.image).toBe("https://kunani.dev/og.png");
    expect(share.twitterCard).toBe("summary_large_image");
    expect(share.url).toBe(site.url);
    expect(existsSync(resolve(process.cwd(), "public/og.png"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/apple-touch-icon.png"))).toBe(
      true,
    );
  });

  it("puts those fields in index.html so Discord, X, Slack, and LinkedIn can scrape them", () => {
    expect(html).toContain(`<title>${share.title}</title>`);
    expect(metaMultiline("name", "description")).toBe(share.description);
    expect(meta("name", "author")).toBe(site.person);
    expect(meta("name", "theme-color")).toBe(site.themeColor);
    expect(html).toContain(`<link rel="canonical" href="${share.url}/" />`);

    expect(meta("property", "og:site_name")).toBe(share.siteName);
    expect(meta("property", "og:title")).toBe(share.title);
    expect(metaMultiline("property", "og:description")).toBe(share.description);
    expect(meta("property", "og:url")).toBe(`${share.url}/`);
    expect(meta("property", "og:type")).toBe(share.type);
    expect(meta("property", "og:locale")).toBe(share.locale);
    expect(meta("property", "og:image")).toBe(share.image);
    expect(meta("property", "og:image:secure_url")).toBe(share.image);
    expect(meta("property", "og:image:type")).toBe(share.imageType);
    expect(meta("property", "og:image:width")).toBe(share.imageWidth);
    expect(meta("property", "og:image:height")).toBe(share.imageHeight);
    expect(metaMultiline("property", "og:image:alt")).toBe(share.imageAlt);

    expect(meta("name", "twitter:card")).toBe(share.twitterCard);
    expect(meta("name", "twitter:site")).toBe(share.twitterSite);
    expect(meta("name", "twitter:creator")).toBe(share.twitterSite);
    expect(meta("name", "twitter:title")).toBe(share.title);
    expect(metaMultiline("name", "twitter:description")).toBe(share.description);
    expect(meta("name", "twitter:image")).toBe(share.image);
    expect(metaMultiline("name", "twitter:image:alt")).toBe(share.imageAlt);
    expect(meta("name", "twitter:url")).toBe(`${share.url}/`);
  });
});
