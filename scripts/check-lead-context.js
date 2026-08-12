import assert from "node:assert/strict";
import {
  LEAD_CONTEXTS,
  isLeadContext,
  pricingContext,
  resolveLeadContext,
} from "../src/lib/leadContext.js";
import { normalizeLead, sanitizeLead } from "../server/processLead.js";

const expectedFixed = [
  "Хедер",
  "Мобільне меню",
  "Банер головної",
  "Калькулятор економії",
  "Як ми працюємо",
  "Калькулятор тарифів",
  "Контакти",
  "Банер сторінки регіону",
  "Банер сторінки рішення",
  "Блок заявки на сторінці регіону",
  "Блок заявки на сторінці рішення",
  "Блок заявки в статті",
  "Сайдбар",
  "Нижня кнопка",
  "Форма тест-драйву",
];

assert.deepEqual(Object.values(LEAD_CONTEXTS).sort(), [...expectedFixed].sort());

for (const value of expectedFixed) {
  assert.equal(isLeadContext(value), true);
}

assert.equal(pricingContext("Стандарт"), "Тарифи · Стандарт");
assert.equal(pricingContext("Комуналка"), "Тарифи · Комуналка");
assert.equal(pricingContext("VIP"), "Тарифи · VIP");
assert.equal(isLeadContext("Тарифи · Стандарт"), true);
assert.equal(isLeadContext("unknown"), false);

const lead = normalizeLead({
  name: "Іван",
  phone: "0950584385",
  cars: "4-10 авто",
  region: "Чернівці",
  page: "/gps-dlya-dostavky/",
  context: LEAD_CONTEXTS.INDUSTRY_HERO,
});

assert.equal(lead.context, "Банер сторінки рішення");
assert.equal(sanitizeLead(lead).context, "Банер сторінки рішення");

const tariffLead = normalizeLead({
  name: "Іван",
  phone: "0950584385",
  context: pricingContext("Стандарт"),
});
assert.equal(tariffLead.context, "Тарифи · Стандарт");

assert.equal(resolveLeadContext(), LEAD_CONTEXTS.TRIAL_FORM);

console.log("lead-context checks passed");
