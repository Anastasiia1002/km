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
assert.match(html, /%ROBOTS_CONTENT%/);

assert.match(vite, /seoHtmlPlugin/);
assert.match(app, /regionSeo/);
assert.match(app, /industries\.find\(\(item\) => path === `\/\$\{item\.slug\}\/`\)/);
assert.match(app, /articleSeo/);
assert.match(app, /relatedArticlesFor/);
assert.match(app, /articlesForIndustry/);
assert.match(app, /region\.seo/);
assert.match(app, /industry\.seo/);
assert.match(app, /trackPageView/);
assert.match(app, /InternalLink/);
assert.match(app, /NotFoundPage/);
assert.match(analytics, /window\.gtag\("event"/);

const redirects = await readFile(path.join(root, "src/lib/legacyRedirects.js"), "utf8");
assert.match(redirects, /\/novyny\//);
assert.match(redirects, /\/kontakty\//);
assert.match(redirects, /\/spetstekhnika\//);

const { resolveLegacyRedirect } = await import("../src/lib/legacyRedirects.js");
const { articleSeo, listSeoPages, industrySeo } = await import("../src/lib/seoPages.js");
const { relatedArticlesFor, articlesForIndustry } = await import("../src/lib/seoRelations.js");
const { articles, industries } = await import("../src/data.js");

const international = articles.find((item) => item.slug === "gps-rishennya-dlya-mizhnarodnykh-perevezen");
assert.ok(international);
assert.ok(articleSeo(international).keywords.includes("SENT"));
assert.ok(articleSeo(international).jsonLd.some((node) => node["@type"] === "Article"));
assert.match(articleSeo(international).jsonLd.find((node) => node["@type"] === "Article").datePublished, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(relatedArticlesFor(international)[0].slug, "shtraf-20-tysiach-zlotykh-za-vidsutnist-pidkliuchennia-do-sent");
assert.ok(articlesForIndustry(industries.find((item) => item.slug === "gps-dlya-agro")).some((item) => item.slug === "gps-monitorynh-silhosptekhniky"));
assert.ok(articlesForIndustry(industries.find((item) => item.slug === "gps-dlya-dostavky")).some((item) => item.slug === "gps-monitorynh-dlya-sluzhb-dostavky"));
assert.equal(industries.find((item) => item.slug === "gps-dlya-dostavky").articleSlug, "gps-monitorynh-dlya-sluzhb-dostavky");
assert.equal(industries.find((item) => item.slug === "gps-dlya-mizhnarodnykh-reysiv").articleSlug, "gps-monitorynh-mizhnarodnykh-pasazhyrskykh-perevezen");
assert.ok(articlesForIndustry(industries.find((item) => item.slug === "gps-dlya-dostavky")).length >= 2);

const pages = listSeoPages();
assert.ok(pages.find((page) => page.path === "/statti/gps-monitorynh-benzovoziv/").jsonLd);
assert.ok(industrySeo(industries[0]).jsonLd.some((node) => node["@type"] === "Service"));
assert.ok(pages.find((page) => page.path === "/gps-dlya-agro/").jsonLd.some((node) => node["@type"] === "Service"));
assert.ok(pages.find((page) => page.path === "/statti/").jsonLd.some((node) => node["@type"] === "CollectionPage"));

for (const article of articles) {
  assert.ok(article.dateIso, `${article.slug} is missing dateIso`);
  assert.ok(!article.description.endsWith("…"), `${article.slug} has a truncated SEO description`);
  assert.ok(article.description.length >= 70 && article.description.length <= 180, `${article.slug} SEO description length ${article.description.length}`);
  assert.ok(articleSeo(article).keywords.length >= 3, `${article.slug} is missing keywords`);
}

assert.equal(resolveLegacyRedirect("/novyny/"), "/statti/");
assert.equal(resolveLegacyRedirect("/novyny/optymizatsiia-karsherynhu/", ["optymizatsiia-karsherynhu"]), "/statti/optymizatsiia-karsherynhu/");
assert.equal(resolveLegacyRedirect("/kontakty/"), "/#contacts");
assert.equal(resolveLegacyRedirect("/spetstekhnika/"), "/gps-dlya-budtekhniky/");
assert.equal(
  resolveLegacyRedirect("/statti/kontrol-palnoho/"),
  "/statti/iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho/",
);

const htaccess = await readFile(path.join(root, "public/.htaccess"), "utf8");
assert.match(htaccess, /www\\.km-trade\\.net/);
assert.match(htaccess, /novyny/);

console.log("seo verification + GA4 wiring ok");
