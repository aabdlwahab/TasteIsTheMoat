/**
 * Prefix root-relative links with Vite's deployment base.
 *
 * Sites builds use `/`, while the GitHub Pages build lives below the
 * `/TasteIsTheMoat/` project path. Hash, relative, protocol, mail, and phone
 * links pass through unchanged.
 */
export function sitePath(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${href.slice(1)}`;
}
