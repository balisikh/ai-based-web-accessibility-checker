import { SITE_DESCRIPTION } from "@/lib/seo";
import { PRODUCT_NAME } from "@/lib/product-copy";
import { absoluteUrl } from "@/lib/site-url";
import {
  BATCH_SNAPSHOT_DATE,
  WEBSITE_BATCH_SUMMARY,
} from "@/lib/website-batch-results";

type JsonLdProps = {
  /** When set, emits WebPage (+ optional BreadcrumbList) instead of WebApplication. */
  page?: "batch";
};

export function JsonLd({ page }: JsonLdProps) {
  if (page === "batch") {
    const batchSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Website batch accessibility results",
      description: `Static snapshot of ${WEBSITE_BATCH_SUMMARY.tested} public sites with Pass/Fail counts and recommended actions. Last resync ${BATCH_SNAPSHOT_DATE}.`,
      url: absoluteUrl("/batch"),
      isPartOf: {
        "@type": "WebSite",
        name: PRODUCT_NAME,
        url: absoluteUrl("/"),
      },
      dateModified: BATCH_SNAPSHOT_DATE,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Checker",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Batch results",
          item: absoluteUrl("/batch"),
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(batchSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </>
    );
  }

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: PRODUCT_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Public http/https URLs only.",
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Live Playwright and axe-core WCAG A/AA scans",
      "Accessibility score and severity breakdown",
      "JSON export",
      "28-site batch results snapshot",
      "Optional AI fix guidance",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: PRODUCT_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
