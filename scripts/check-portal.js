import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portalDir = path.join(root, "public", "client-nexus-portal");
const distPortalDir = path.join(root, "dist", "client-nexus-portal");

const requiredPortalFiles = [
  "bootstrap.php",
  "index.php",
  "config.php",
  "config.local.php.example",
  "functions.php",
  "csrf.php",
  "health.php",
  "install-check.php",
  "script.js",
  "styles.css",
  "nginx.snippet.conf",
  ".htaccess",
  "api/auth.php",
  "api/get_list.php",
  "api/update_status.php",
];

const bootstrapSnippets = [
  "portal_handle_preflight",
  "portal_start_session",
  "portal_base_path",
  "portal_json_response",
];

const nginxSnippets = [
  "location ^~ /client-nexus-portal/",
  "root /home/admin/web/km-trade.net/public_html",
  "install-check.php",
];

async function assertFile(baseDir, relativePath) {
  await access(path.join(baseDir, relativePath));
}

for (const file of requiredPortalFiles) {
  await assertFile(portalDir, file);
}

const bootstrap = await readFile(path.join(portalDir, "bootstrap.php"), "utf8");
for (const snippet of bootstrapSnippets) {
  if (!bootstrap.includes(snippet)) {
    throw new Error(`bootstrap.php is missing ${snippet}`);
  }
}

const nginx = await readFile(path.join(portalDir, "nginx.snippet.conf"), "utf8");
for (const snippet of nginxSnippets) {
  if (!nginx.includes(snippet)) {
    throw new Error(`nginx.snippet.conf is missing ${snippet}`);
  }
}

const indexPhp = await readFile(path.join(portalDir, "index.php"), "utf8");
for (const snippet of ["bootstrap.php", "portal_asset_url", "portal_site_asset_url", "portal_start_session"]) {
  if (!indexPhp.includes(snippet)) {
    throw new Error(`index.php is missing ${snippet}`);
  }
}

try {
  await access(path.join(distPortalDir, "bootstrap.php"));
  await access(path.join(distPortalDir, "install-check.php"));
} catch {
  throw new Error("Run npm run build first — dist/client-nexus-portal/ is incomplete");
}

try {
  await access(path.join(distPortalDir, "config.local.php"));
  throw new Error("dist/client-nexus-portal/config.local.php must not be published");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

console.log(`Checked client-nexus-portal (${requiredPortalFiles.length} files, nginx snippet, bootstrap helpers)`);
