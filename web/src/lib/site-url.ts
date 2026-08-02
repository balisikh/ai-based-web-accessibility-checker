/** Public site origin for SEO metadata (canonical, Open Graph, sitemap). */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, "");
    return new URL(`${normalized}/`);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return new URL(`https://${vercel.replace(/\/+$/, "")}/`);
  }

  return new URL("http://localhost:4376/");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalized, getSiteUrl()).toString();
}
