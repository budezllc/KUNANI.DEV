import { projects } from "../data/projects.ts";
import { aboutBlurb, aboutBody, site, socials } from "../data/site.ts";
import type { Project } from "../data/types.ts";

export const SSG_HOME_ID = "ssg-home";

const EMPTY_ROOT = '<div id="root"></div>';

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Hide crawler markup as soon as JS runs so the React session does not flash. */
export function prerenderHeadSnippet(homeId = SSG_HOME_ID): string {
  return `<script>document.documentElement.classList.add("has-js");</script>
    <style>
      .has-js #${homeId} {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    </style>`;
}

export function catalogJsonLd(list: Project[] = projects): string {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: site.name,
        url: `${site.url}/`,
        description: site.description,
        author: { "@type": "Person", name: site.person },
      },
      {
        "@type": "ItemList",
        itemListElement: list.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: project.title,
          url: `${site.url}/#${project.slug}`,
          description: project.summary,
        })),
      },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
}

function projectSection(project: Project): string {
  const links = project.links
    .map(
      (link) =>
        `<a class="btn btn-ghost" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    )
    .join("");
  return [
    `<section class="chapter" id="${escapeHtml(project.slug)}">`,
    '<article class="artifact">',
    `<p class="hud-meta"><span>${escapeHtml(project.kicker)}</span><span>${escapeHtml(project.year)}</span></p>`,
    `<h2>${escapeHtml(project.title)}</h2>`,
    `<p class="lede">${escapeHtml(project.summary)}</p>`,
    `<p class="body">${escapeHtml(project.body)}</p>`,
    `<div class="link-row">${links}</div>`,
    "</article>",
    "</section>",
  ].join("");
}

/** Crawler-visible home catalog. Same copy and order as the React session. */
export function catalogHomeHtml(list: Project[] = projects): string {
  const chapters = list.map(projectSection).join("");
  const social = socials
    .map(
      (item) =>
        `<a class="btn btn-ghost" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`,
    )
    .join("");
  return [
    `<main id="${SSG_HOME_ID}">`,
    '<section class="hero" id="hero">',
    `<h1 class="hero-title">${escapeHtml(site.name.toUpperCase())}</h1>`,
    `<p class="hero-line">${escapeHtml(site.heroLine)}</p>`,
    `<p class="hero-tag">${escapeHtml(site.tagline)}</p>`,
    `<p>${escapeHtml(site.description)}</p>`,
    "</section>",
    chapters,
    '<section class="chapter about" id="about">',
    '<article class="artifact">',
    `<h2>${escapeHtml(site.person)}</h2>`,
    `<p class="lede">${escapeHtml(aboutBody)}</p>`,
    `<p class="body about-blurb">${escapeHtml(aboutBlurb)}</p>`,
    `<div class="link-row">${social}</div>`,
    "</article>",
    "</section>",
    "</main>",
  ].join("");
}

export function assertSeoShell(html: string): void {
  if (!html.includes(`<title>${site.title}</title>`)) {
    throw new Error("prerender: index.html title must match site.title");
  }
  if (!html.includes(site.description)) {
    throw new Error("prerender: index.html must include the unique site description");
  }
}

export function injectPrerenderHtml(html: string, list: Project[] = projects): string {
  assertSeoShell(html);
  if (html.includes(`id="${SSG_HOME_ID}"`)) {
    return html;
  }
  if (!html.includes(EMPTY_ROOT)) {
    throw new Error(`prerender: expected ${EMPTY_ROOT} in index.html`);
  }
  const extras = `    ${prerenderHeadSnippet()}\n    ${catalogJsonLd(list)}\n`;
  return html
    .replace("  </head>", `${extras}  </head>`)
    .replace(EMPTY_ROOT, `<div id="root">${catalogHomeHtml(list)}</div>`);
}
