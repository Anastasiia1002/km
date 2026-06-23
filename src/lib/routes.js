export const BASE = import.meta.env.BASE_URL;

export function stripBase(pathname) {
  if (BASE !== "/" && pathname.startsWith(BASE)) {
    const stripped = pathname.slice(BASE.length - 1);
    return stripped || "/";
  }
  return pathname;
}

export function normalizePath(pathname) {
  const path = stripBase(pathname);
  if (path === "/" || path === "") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function withBase(href) {
  if (href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return href;
  }

  if (href.includes("#")) {
    const [path, hash] = href.split("#");
    const basePath = path ? withBase(path) : BASE;
    return `${basePath}#${hash}`;
  }

  if (href.startsWith("/")) {
    return `${BASE.replace(/\/$/, "")}${href}`;
  }

  return href;
}
