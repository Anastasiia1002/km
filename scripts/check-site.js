import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const distDir = path.join(root, "dist");

const requiredPublicFiles = [
  "sitemap.xml",
  "robots.txt",
  "assets/styles.css",
];

const expectedSitemapRoutes = [
  "/",
  "/gps-monitoring-chernivtsi/",
  "/gps-monitoring-ivano-frankivsk/",
  "/gps-monitoring-ternopil/",
  "/gps-monitoring-khmelnytskyi/",
  "/gps-dlya-vantazhivok/",
  "/gps-dlya-agro/",
  "/gps-dlya-budtekhniky/",
  "/gps-dlya-taksi/",
  "/gps-dlya-dostavky/",
  "/gps-dlya-korporatyvnoho-parku/",
  "/gps-dlya-azs/",
  "/gps-dlya-mizhnarodnykh-reysiv/",
  "/statti/",
  "/statti/kontrol-palnoho/",
  "/statti/shcho-take-wialon/",
  "/statti/okupnist-gps-monitoringu/",
  "/statti/gps-dlya-traktora-zakhid-ukraina/",
  "/statti/yak-pereviryty-vodiya-gps/",
  "/statti/gps-monitoring-u-zakhidniy-ukraini/",
  "/oferta/",
  "/konfidentsiynist/",
];

async function assertFile(baseDir, relativePath) {
  await access(path.join(baseDir, relativePath));
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of requiredPublicFiles) {
  await assertFile(publicDir, file);
}

await assertFile(distDir, "index.html");
await assertFile(distDir, "404.html");

const distFiles = await collectFiles(distDir);
const jsBundles = distFiles.filter((file) => file.endsWith(".js"));
const cssAssets = distFiles.filter((file) => file.endsWith(".css"));

if (jsBundles.length === 0) {
  throw new Error("Vite build did not produce a JavaScript bundle");
}

if (cssAssets.length === 0) {
  throw new Error("Vite build did not copy CSS assets");
}

const index = await readFile(path.join(distDir, "index.html"), "utf8");
for (const snippet of ["<title>", 'name="description"', 'id="root"', 'type="module"']) {
  if (!index.includes(snippet)) {
    throw new Error(`dist/index.html is missing ${snippet}`);
  }
}

const appSource = await readFile(path.join(root, "src", "App.jsx"), "utf8");
for (const snippet of ["function HomePage", "function RegionPage", "function IndustryPage", "function LeadForm", "calculator_used", "region_page_view"]) {
  if (!appSource.includes(snippet)) {
    throw new Error(`src/App.jsx is missing ${snippet}`);
  }
}

const sitemap = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");
const urlCount = (sitemap.match(/<url>/g) || []).length;
if (urlCount !== expectedSitemapRoutes.length) {
  throw new Error(`Sitemap URL count (${urlCount}) does not match expected route count (${expectedSitemapRoutes.length})`);
}

for (const route of expectedSitemapRoutes) {
  if (!sitemap.includes(`https://km-trade.net${route}`)) {
    throw new Error(`Sitemap is missing ${route}`);
  }
}

console.log(`Checked React build, ${jsBundles.length} JS bundle(s), ${cssAssets.length} CSS asset(s), and ${urlCount} sitemap URLs`);
