import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/data.js";
import { robotsMetaContent } from "../src/lib/seoConfig.js";
import { listSeoPages } from "../src/lib/seoPages.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceAttr(html, attr, name, content) {
  const pattern = new RegExp(`(<meta[^>]*${attr}="${name}"[^>]*content=")([^"]*)(")`);
  if (pattern.test(html)) return html.replace(pattern, `$1${escapeHtml(content)}$3`);
  return html;
}

function injectPage(html, page) {
  const url = `${site.baseUrl}${page.path === "/" ? "/" : page.path}`;
  const keywords = Array.isArray(page.keywords) ? page.keywords.join(", ") : page.keywords || "";
  const image = page.image || site.ogImage;
  const robots = robotsMetaContent();

  let next = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  next = replaceAttr(next, "name", "description", page.description);
  next = replaceAttr(next, "name", "robots", robots);
  next = replaceAttr(next, "name", "keywords", keywords);
  next = replaceAttr(next, "property", "og:title", page.title);
  next = replaceAttr(next, "property", "og:description", page.description);
  next = replaceAttr(next, "property", "og:url", url);
  next = replaceAttr(next, "property", "og:type", page.type || "website");
  next = replaceAttr(next, "property", "og:image", image);
  next = replaceAttr(next, "name", "twitter:title", page.title);
  next = replaceAttr(next, "name", "twitter:description", page.description);
  next = replaceAttr(next, "name", "twitter:image", image);
  next = next.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  next = next.replace(/<link rel="alternate" hrefLang="uk" href="[^"]*" \/>/, `<link rel="alternate" hrefLang="uk" href="${url}" />`);

  if (page.jsonLd) {
    const block = `\n    <script type="application/ld+json" id="page-jsonld">${JSON.stringify(page.jsonLd)}</script>`;
    next = next.replace("</head>", `${block}\n  </head>`);
  }

  return next;
}

const template = await readFile(path.join(distDir, "index.html"), "utf8");
const pages = listSeoPages();
let written = 0;

for (const page of pages) {
  const html = injectPage(template, page);
  if (page.path === "/") {
    await writeFile(path.join(distDir, "index.html"), html);
  } else {
    const dir = path.join(distDir, page.path.replace(/^\//, "").replace(/\/$/, ""));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), html);
  }
  written += 1;
}

console.log(`Prerendered ${written} SEO HTML pages into dist/`);
