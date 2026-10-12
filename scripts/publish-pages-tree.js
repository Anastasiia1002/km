import { cp, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

async function removeOldBundles() {
  let names = [];
  try {
    names = await readdir(path.join(root, "assets"));
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((name) => /^index-.*\.js$/.test(name))
      .map((name) => unlink(path.join(root, "assets", name))),
  );
}

await removeOldBundles();

const entries = await readdir(dist, { withFileTypes: true });
for (const entry of entries) {
  await cp(path.join(dist, entry.name), path.join(root, entry.name), {
    recursive: true,
    force: true,
  });
}

console.log(`Published ${entries.length} dist entries to the repository root for GitHub Pages`);
