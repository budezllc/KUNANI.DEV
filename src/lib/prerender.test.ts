import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { site } from "../data/site";
import {
  SSG_HOME_ID,
  catalogHomeHtml,
  catalogJsonLd,
  escapeHtml,
  injectPrerenderHtml,
} from "./prerender";

const shell = `<!doctype html>
<html lang="en">
  <head>
    <title>${site.title}</title>
    <meta name="description" content="${site.description}" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

describe("prerender catalog", () => {
  it("escapes HTML in catalog copy", () => {
    expect(escapeHtml(`Kei & "Sakai" <dev>`)).toBe(
      "Kei &amp; &quot;Sakai&quot; &lt;dev&gt;",
    );
  });

  it("writes MASKCLAW first with titles, years, and the unique description", () => {
    const html = catalogHomeHtml();
    expect(html).toContain(`id="${SSG_HOME_ID}"`);
    expect(html).toContain(site.description);
    expect(html).toContain("MASKCLAW");
    expect(html.indexOf("MASKCLAW")).toBeLessThan(html.indexOf("Dictate Capture"));
    expect(html.indexOf('id="maskclaw"')).toBeLessThan(html.indexOf('id="dictate-capture"'));
    for (const project of projects) {
      expect(html).toContain(`<h2>${project.title}</h2>`);
      expect(html).toContain(project.year);
      expect(html).toContain(project.summary);
    }
  });

  it("injects catalog into #root and keeps title plus unique description", () => {
    const html = injectPrerenderHtml(shell);
    expect(html).toContain(`<title>${site.title}</title>`);
    expect(html).toContain(site.description);
    expect(html).not.toContain('<div id="root"></div>');
    expect(html).toContain('<div id="root">');
    expect(html).toContain("MASKCLAW");
    expect(html).toContain("application/ld+json");
    expect(html).toBe(injectPrerenderHtml(html));
  });

  it("lists catalog titles in JSON-LD in MASKCLAW-first order", () => {
    const ld = catalogJsonLd();
    const parsed = JSON.parse(
      ld.replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, ""),
    ) as {
      "@graph": Array<{ itemListElement?: Array<{ name: string; position: number }> }>;
    };
    const items = parsed["@graph"].find((node) => node.itemListElement)?.itemListElement;
    expect(items?.[0]).toMatchObject({ position: 1, name: "MASKCLAW" });
    expect(items?.map((item) => item.name)).toEqual(projects.map((project) => project.title));
  });

  it("rejects a shell that dropped the unique description", () => {
    expect(() =>
      injectPrerenderHtml(`<html><head><title>${site.title}</title></head><body><div id="root"></div></body></html>`),
    ).toThrow(/unique site description/);
  });
});
