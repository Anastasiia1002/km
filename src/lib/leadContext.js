import { articles, industries, regions } from "../data.js";
import { normalizePath } from "./routes.js";

/** Storage key for the CTA that scrolled the user to the lead form. */
const STORAGE_KEY = "km_lead_context";
const CONTEXT_MAX = 120;

/**
 * Block names (Ukrainian) — the part after « / » in context.
 * Full value is always: «{назва сторінки} / {блок}».
 */
export const LEAD_BLOCKS = Object.freeze({
  HEADER: "Хедер",
  HEADER_MOBILE: "Мобільне меню",
  BANNER: "Банер",
  CALCULATOR: "Калькулятор економії",
  HOW_IT_WORKS: "Як ми працюємо",
  PRICING_CALCULATOR: "Калькулятор тарифів",
  CONTACTS: "Контакти",
  /** Mid-content «Спробувати безкоштовно» block (not the top banner). */
  CTA_BLOCK: "Блок заявки",
  SIDEBAR: "Сайдбар",
  STICKY_CTA: "Нижня кнопка",
  TRIAL_FORM: "Форма тест-драйву",
});

/** @deprecated Use LEAD_BLOCKS — kept as alias for older imports. */
export const LEAD_CONTEXTS = LEAD_BLOCKS;

/** Ukrainian page label for the current (or given) pathname. */
export function resolvePageLabel(pathname) {
  const raw =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const path = normalizePath(raw);

  if (path === "/") return "Головна";

  const region = regions.find((item) => path === `/${item.slug}/`);
  if (region) return region.city;

  const industry = industries.find((item) => path === `/${item.slug}/`);
  if (industry) return industry.name;

  if (path === "/statti/") return "Статті";

  const article = articles.find((item) => path === `/statti/${item.slug}/`);
  if (article) return article.category;

  if (path === "/oferta/") return "Оферта";
  if (path === "/konfidentsiynist/") return "Конфіденційність";

  return "Сайт";
}

/** Build «Сторінка / Блок», e.g. «Доставка / Банер». */
export function formatLeadContext(pageLabel, block) {
  const page = String(pageLabel || "").trim() || "Сайт";
  const part = String(block || "").trim() || LEAD_BLOCKS.TRIAL_FORM;
  return `${page} / ${part}`.slice(0, CONTEXT_MAX);
}

/**
 * Context for the current page + block.
 * @param {string} block — Ukrainian block name (or «Тарифи · Стандарт»)
 * @param {string} [pageLabel] — override page label; default from location
 */
export function leadContext(block, pageLabel) {
  return formatLeadContext(pageLabel ?? resolvePageLabel(), block);
}

/** Context for a pricing package on the current page. */
export function pricingContext(packageName, pageLabel) {
  const name = String(packageName || "").trim() || "пакет";
  return leadContext(`Тарифи · ${name}`, pageLabel);
}

export function isLeadContext(value) {
  const text = String(value || "").trim();
  if (!text || text.length > CONTEXT_MAX) return false;
  const sep = " / ";
  const index = text.indexOf(sep);
  if (index <= 0) return false;
  const page = text.slice(0, index).trim();
  const block = text.slice(index + sep.length).trim();
  return Boolean(page && block);
}

export function setLeadContext(context) {
  const value = String(context || "").trim().slice(0, CONTEXT_MAX);
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

/** Context to send with the lead: last CTA, or current page + form. */
export function resolveLeadContext() {
  const stored = getLeadContext();
  if (stored && isLeadContext(stored)) return stored;
  if (stored) return stored.slice(0, CONTEXT_MAX);
  return leadContext(LEAD_BLOCKS.TRIAL_FORM);
}
