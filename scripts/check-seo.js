import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GA_MEASUREMENT_ID, GOOGLE_SITE_VERIFICATION, homeKeywords } from "../src/lib/seoConfig.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const html = await readFile(path.join(root, "index.html"), "utf8");
const app = await readFile(path.join(root, "src/App.jsx"), "utf8");
const analytics = await readFile(path.join(root, "src/lib/analytics.js"), "utf8");
const vite = await readFile(path.join(root, "vite.config.js"), "utf8");

assert.equal(GOOGLE_SITE_VERIFICATION, "QrF2hqH_IzUAZe0nkb3LvNstSQJcfpfTpRa7UBx15fk");
assert.equal(GA_MEASUREMENT_ID, "G-65HEG2DBC7");
assert.ok(homeKeywords.includes("GPS моніторинг Чернівці"));

assert.match(html, /name="google-site-verification"/);
assert.match(html, /%GOOGLE_SITE_VERIFICATION%/);
assert.match(html, /googletagmanager\.com\/gtag\/js\?id=%GA_MEASUREMENT_ID%/);
assert.match(html, /gtag\("config", "%GA_MEASUREMENT_ID%"/);
assert.match(html, /name="keywords"/);
assert.match(html, /content="index, follow/);

assert.match(vite, /seoHtmlPlugin/);
assert.match(app, /keywords: region\.keys/);
assert.match(app, /trackPageView/);
assert.match(analytics, /window\.gtag\("event"/);

console.log("seo verification + GA4 wiring ok");
