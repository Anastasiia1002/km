/** Storage key for the CTA that scrolled the user to the lead form. */
const STORAGE_KEY = "km_lead_context";

/**
 * Human-readable Ukrainian contexts sent as `context` in POST /api/lead.
 * Combined with `page` (pathname) this identifies where the lead came from
 * (e.g. page `/gps-dlya-dostavky/` + context `Банер сторінки рішення`).
 *
 * «Блок заявки …» — сірий/синій блок посеред тексту сторінки з кнопкою
 * «Спробувати безкоштовно» (не хедер і не банер зверху).
 */
export const LEAD_CONTEXTS = Object.freeze({
  HEADER: "Хедер",
  HEADER_MOBILE: "Мобільне меню",
  HERO: "Банер головної",
  CALCULATOR: "Калькулятор економії",
  HOW_IT_WORKS: "Як ми працюємо",
  PRICING_CALCULATOR: "Калькулятор тарифів",
  CONTACTS: "Контакти",
  REGION_HERO: "Банер сторінки регіону",
  INDUSTRY_HERO: "Банер сторінки рішення",
  REGION_CTA: "Блок заявки на сторінці регіону",
  INDUSTRY_CTA: "Блок заявки на сторінці рішення",
  ARTICLE_CTA: "Блок заявки в статті",
  SIDEBAR: "Сайдбар",
  STICKY_CTA: "Нижня кнопка",
  /** User opened / filled the trial form without clicking a CTA first. */
  TRIAL_FORM: "Форма тест-драйву",
});

const PRICING_PREFIX = "Тарифи · ";

const FIXED = new Set(Object.values(LEAD_CONTEXTS));

/** Context for a specific pricing package, e.g. «Тарифи · Стандарт». */
export function pricingContext(packageName) {
  const name = String(packageName || "").trim() || "пакет";
  return `${PRICING_PREFIX}${name}`.slice(0, 80);
}

export function isLeadContext(value) {
  const text = String(value || "");
  if (FIXED.has(text)) return true;
  return text.startsWith(PRICING_PREFIX) && text.length > PRICING_PREFIX.length && text.length <= 80;
}

export function setLeadContext(context) {
  const value = String(context || "").trim().slice(0, 80);
  if (!value || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function getLeadContext() {
  if (typeof sessionStorage === "undefined") return "";
  try {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearLeadContext() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

/** Context to send with the lead: last CTA, or default if none. */
export function resolveLeadContext() {
  const stored = getLeadContext();
  if (stored && isLeadContext(stored)) return stored;
  if (stored) return stored.slice(0, 80);
  return LEAD_CONTEXTS.TRIAL_FORM;
}
