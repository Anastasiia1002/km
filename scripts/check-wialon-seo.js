import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = await readFile(path.join(root, "src/App.jsx"), "utf8");
const link = await readFile(path.join(root, "src/lib/SeoNeutralLink.jsx"), "utf8");

assert.equal(
  /href="https:\/\/(gps|hosting)\.km-trade\.net/.test(app),
  false,
  "Wialon destinations must not be crawlable href values in App.jsx",
);
assert.match(app, /<SeoNeutralLink/);
assert.match(app, /to="https:\/\/gps\.km-trade\.net\/"/);
assert.match(app, /to="https:\/\/hosting\.km-trade\.net\/\?lang=uk"/);
assert.match(link, /nofollow noopener noreferrer/);
assert.match(link, /window\.open/);
assert.match(link, /PLACEHOLDER_HREF/);
assert.doesNotMatch(link, /useEffect/);

console.log("wialon seo-neutral links ok");
