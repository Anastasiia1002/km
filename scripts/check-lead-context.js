import { articles } from "../src/data.js";
import { importedArticles } from "../src/content/importedArticles.js";
import assert from "node:assert/strict";
import {
  LEAD_BLOCKS,
  formatLeadContext,
  isLeadContext,
  leadContext,
  pricingContext,
  resolveLeadContext,
  resolvePageLabel,
} from "../src/lib/leadContext.js";
import { normalizeLead, sanitizeLead } from "../server/processLead.js";

assert.equal(resolvePageLabel("/"), "Головна");
assert.equal(resolvePageLabel("/gps-dlya-dostavky/"), "Доставка");
assert.equal(resolvePageLabel("/gps-monitoring-chernivtsi/"), "Чернівці");
assert.equal(resolvePageLabel("/statti/kontrol-palnoho/"), "Пальне");
assert.equal(resolvePageLabel("/statti/iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho/"), "Пальне");
assert.equal(resolvePageLabel("/novyny/optymizatsiia-karsherynhu/"), "Бізнес");
assert.equal(resolvePageLabel("/oferta/"), "Оферта");

assert.equal(formatLeadContext("Доставка", "Банер"), "Доставка / Банер");
assert.equal(leadContext(LEAD_BLOCKS.HEADER, "Головна"), "Головна / Хедер");
assert.equal(pricingContext("Стандарт", "Головна"), "Головна / Тарифи · Стандарт");
assert.equal(pricingContext("VIP", "Доставка"), "Доставка / Тарифи · VIP");

assert.equal(isLeadContext("Доставка / Блок заявки"), true);
assert.equal(isLeadContext("Головна / Тарифи · Комуналка"), true);
assert.equal(isLeadContext("Банер"), false);
assert.equal(isLeadContext("unknown"), false);

const lead = normalizeLead({
  name: "Іван",
  phone: "0950584385",
  cars: "4-10 авто",
  region: "Чернівці",
  page: "/gps-dlya-dostavky/",
  context: leadContext(LEAD_BLOCKS.BANNER, "Доставка"),
});

assert.equal(lead.context, "Доставка / Банер");
assert.equal(sanitizeLead(lead).context, "Доставка / Банер");

assert.equal(resolveLeadContext(), leadContext(LEAD_BLOCKS.TRIAL_FORM, resolvePageLabel("/")));

assert.equal(importedArticles.length, 9);
assert.equal(articles.length, 15);
const slugs = articles.map((item) => item.slug);
assert.equal(new Set(slugs).size, slugs.length);
for (const item of importedArticles) {
  assert.ok(item.html && item.html.includes("<p>"), `${item.slug} is missing HTML content`);
  assert.ok(item.dateIso, `${item.slug} is missing dateIso`);
}

const blocks = Object.values(LEAD_BLOCKS);
assert.ok(blocks.includes("Банер"));
assert.ok(blocks.includes("Блок заявки"));
assert.ok(!blocks.includes("hero"));

console.log("lead-context checks passed");
