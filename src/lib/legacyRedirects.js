/** Old WordPress / marketing URLs that must 301 onto the current React routes. */
export const legacyRedirects = [
  { from: "/novyny/", to: "/statti/" },
  { from: "/kontakty/", to: "/#contacts" },
  { from: "/contacts/", to: "/#contacts" },
  { from: "/spetstekhnika/", to: "/gps-dlya-budtekhniky/" },
  { from: "/gps-monitoring/", to: "/" },
  { from: "/statti/kontrol-palnoho/", to: "/statti/iak-gps-monitorynh-dopomahaie-zapobihty-zlyvam-palnoho/" },
];

export function resolveLegacyRedirect(path, articleSlugs = []) {
  const exact = legacyRedirects.find((item) => item.from === path);
  if (exact) return exact.to;

  const news = path.match(/^\/novyny\/([^/]+)\/$/);
  if (news) {
    return articleSlugs.includes(news[1]) ? `/statti/${news[1]}/` : "/statti/";
  }

  return null;
}
