/** Top-level paths that a person slug must never shadow. */
export const RESERVED_SLUGS = new Set([
  "app", "match", "report", "api", "_next", "static", "favicon.ico", "robots.txt", "sitemap.xml",
  "about", "privacy", "terms",
]);

/**
 * Human-friendly URL slug from a name: accents stripped, lowercased, non-alphanumerics → "-".
 * Empty results become "person"; reserved words get a "-1" suffix.
 */
export function toSlug(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  const slug = base || "person";
  return RESERVED_SLUGS.has(slug) ? `${slug}-1` : slug;
}

/**
 * First free slug given the ones already taken: "rahul", then "rahul-2", "rahul-3", …
 * `taken` should contain every existing slug that starts with `base`.
 */
export function nextSlug(base: string, taken: Iterable<string>): string {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!set.has(candidate)) return candidate;
  }
}

/** Decode a slug from the URL (handles percent-encoding and case). */
export function slugFromParam(param: string): string {
  try {
    return decodeURIComponent(param).toLowerCase();
  } catch {
    return param.toLowerCase();
  }
}
