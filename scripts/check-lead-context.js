import assert from "node:assert/strict";
import { LEAD_CONTEXTS, isLeadContext, resolveLeadContext } from "../src/lib/leadContext.js";
import { normalizeLead, sanitizeLead } from "../server/processLead.js";

const expected = [
  "header",
  "header_mobile",
  "hero",
  "calculator",
  "how_it_works",
  "pricing",
  "pricing_calculator",
  "contacts",
  "region_hero",
  "industry_hero",
  "region_cta",
  "industry_cta",
  "article_cta",
  "sidebar",
  "sticky_cta",
  "trial_form",
];

assert.deepEqual(Object.values(LEAD_CONTEXTS).sort(), [...expected].sort());

for (const value of expected) {
  assert.equal(isLeadContext(value), true);
}
assert.equal(isLeadContext("unknown"), false);

const lead = normalizeLead({
  name: "Іван",
  phone: "0950584385",
  cars: "4-10 авто",
  region: "Чернівці",
  page: "/gps-dlya-dostavky/",
  context: LEAD_CONTEXTS.INDUSTRY_HERO,
});

assert.equal(lead.context, "industry_hero");
assert.equal(sanitizeLead(lead).context, "industry_hero");
assert.equal(resolveLeadContext(), LEAD_CONTEXTS.TRIAL_FORM);

console.log("lead-context checks passed");
