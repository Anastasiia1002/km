import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const requiredRoutes = [
  "index.html",
  "gps-monitoring-chernivtsi/index.html",
  "gps-monitoring-ivano-frankivsk/index.html",
  "gps-monitoring-ternopil/index.html",
  "gps-monitoring-khmelnytskyi/index.html",
  "gps-dlya-vantazhivok/index.html",
  "gps-dlya-agro/index.html",
  "gps-dlya-budtekhniky/index.html",
  "gps-dlya-taksi/index.html",
  "gps-dlya-dostavky/index.html",
  "gps-dlya-korporatyvnoho-parku/index.html",
  "gps-dlya-azs/index.html",
  "gps-dlya-mizhnarodnykh-reysiv/index.html",
  "statti/index.html",
  "sitemap.xml",
  "robots.txt",
  "assets/styles.css",
  "assets/main.js",
];

async function assertFile(relativePath) {
  await access(path.join(publicDir, relativePath));
}

async function collectHtmlFiles(dir = publicDir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(fullPath));
    } else if (entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const route of requiredRoutes) {
  await assertFile(route);
}

const htmlFiles = await collectHtmlFiles();
if (htmlFiles.length < 20) {
  throw new Error(`Expected at least 20 generated HTML pages, got ${htmlFiles.length}`);
}

for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  const relative = path.relative(publicDir, file);
  for (const snippet of ["<title>", 'name="description"', 'rel="canonical"', 'id="lead-form"', "LocalBusiness"]) {
    if (!source.includes(snippet)) {
      throw new Error(`${relative} is missing ${snippet}`);
    }
  }
}

const sitemap = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");
const urlCount = (sitemap.match(/<url>/g) || []).length;
if (urlCount !== htmlFiles.length) {
  throw new Error(`Sitemap URL count (${urlCount}) does not match HTML page count (${htmlFiles.length})`);
}

console.log(`Checked ${htmlFiles.length} pages and ${urlCount} sitemap URLs`);
