import { site } from "../data.js";

export function pushEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
}

export function trackPageView({ title, path }) {
  if (typeof window.gtag !== "function") return;
  const pagePath = path === "/" ? "/" : path;
  window.gtag("event", "page_view", {
    page_title: title,
    page_location: `${site.baseUrl}${pagePath === "/" ? "/" : pagePath}`,
    page_path: pagePath,
  });
}
