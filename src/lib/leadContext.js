/** Storage key for the CTA that scrolled the user to the lead form. */
const STORAGE_KEY = "km_lead_context";

/**
 * All CTA / form entry contexts sent as `context` in POST /api/lead.
 * Combined with `page` (pathname) this identifies where the lead came from
 * (e.g. page `/gps-dlya-dostavky/` + context `industry_hero`).
 */
export const LEAD_CONTEXTS = Object.freeze({
  HEADER: "header",
  HEADER_MOBILE: "header_mobile",
  HERO: "hero",
  CALCULATOR: "calculator",
  HOW_IT_WORKS: "how_it_works",
  PRICING: "pricing",
  PRICING_CALCULATOR: "pricing_calculator",
  CONTACTS: "contacts",
  REGION_HERO: "region_hero",
  INDUSTRY_HERO: "industry_hero",
  REGION_CTA: "region_cta",
  INDUSTRY_CTA: "industry_cta",
  ARTICLE_CTA: "article_cta",
  SIDEBAR: "sidebar",
  STICKY_CTA: "sticky_cta",
  /** User opened / filled the trial form without clicking a CTA first. */
  TRIAL_FORM: "trial_form",
});

const ALLOWED = new Set(Object.values(LEAD_CONTEXTS));

export function isLeadContext(value) {
  return ALLOWED.has(String(value || ""));
}

export function setLeadContext(context) {
  const value = String(context || "").trim();
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

/** Context to send with the lead: last CTA, or trial_form if none. */
export function resolveLeadContext() {
  const stored = getLeadContext();
  if (stored && isLeadContext(stored)) return stored;
  if (stored) return stored.slice(0, 80);
  return LEAD_CONTEXTS.TRIAL_FORM;
}
