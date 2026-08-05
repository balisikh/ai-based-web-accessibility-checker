import type { Metadata } from "next";
import { PRODUCT_NAME } from "./product-copy";
import { absoluteUrl, getSiteUrl } from "./site-url";

export const SITE_TITLE =
  "Lumen — WCAG accessibility scanner with optional AI guidance";

export const SITE_DESCRIPTION =
  "Scan any public page for WCAG accessibility issues, with optional AI fix guidance. Playwright + axe-core, scored reports, JSON and PDF export.";

export const SITE_KEYWORDS = [
  "accessibility checker",
  "WCAG scanner",
  "axe-core",
  "web accessibility testing",
  "automated accessibility audit",
  "a11y checker",
  "accessibility score",
  "Playwright accessibility",
];

const OG_IMAGE_PATH = "/og.png";

function sharedOpenGraph(
  title: string,
  description: string,
  path: string,
): NonNullable<Metadata["openGraph"]> {
  const url = absoluteUrl(path);
  return {
    type: "website",
    locale: "en_GB",
    url,
    siteName: PRODUCT_NAME,
    title,
    description,
    images: [
      {
        url: absoluteUrl(OG_IMAGE_PATH),
        width: 1280,
        height: 720,
        alt: `${PRODUCT_NAME} — accessibility checker home and batch results`,
      },
    ],
  };
}

function sharedTwitter(
  title: string,
  description: string,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteUrl(OG_IMAGE_PATH)],
  };
}

/** Root layout metadata — title template and site-wide defaults. */
export function rootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const defaultTitle = `${PRODUCT_NAME} | WCAG Accessibility Checker`;

  return {
    metadataBase: siteUrl,
    title: {
      default: defaultTitle,
      template: `%s | ${PRODUCT_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    applicationName: PRODUCT_NAME,
    category: "technology",
    creator: PRODUCT_NAME,
    publisher: PRODUCT_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: sharedOpenGraph(defaultTitle, SITE_DESCRIPTION, "/"),
    twitter: sharedTwitter(defaultTitle, SITE_DESCRIPTION),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: "/",
    },
  };
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

/** Per-route metadata with canonical URL and matching social cards. */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} | ${PRODUCT_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: sharedOpenGraph(fullTitle, description, path),
    twitter: sharedTwitter(fullTitle, description),
    ...(noIndex
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export { OG_IMAGE_PATH };
