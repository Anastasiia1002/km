/** Public webmaster / analytics IDs restored from the previous km-trade.net site. */
export const GOOGLE_SITE_VERIFICATION = "QrF2hqH_IzUAZe0nkb3LvNstSQJcfpfTpRa7UBx15fk";
export const GA_MEASUREMENT_ID = "G-65HEG2DBC7";

export const homeKeywords = [
  "GPS моніторинг",
  "GPS моніторинг Чернівці",
  "GPS моніторинг Україна",
  "Wialon",
  "контроль пального",
  "GPS трекер для автопарку",
];

export function isIndexingHost(hostname = "") {
  return !/github\.io$/i.test(hostname);
}

export function robotsMetaContent({ hostname } = {}) {
  const envOff = typeof process !== "undefined" && process.env?.VITE_INDEXING === "false";
  const host = hostname || (typeof window !== "undefined" ? window.location.hostname : "");
  const allow = !envOff && isIndexingHost(host);
  return allow
    ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    : "noindex, nofollow";
}
