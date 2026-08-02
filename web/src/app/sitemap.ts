import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { BATCH_SNAPSHOT_DATE } from "@/lib/website-batch-results";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/batch"),
      lastModified: new Date(`${BATCH_SNAPSHOT_DATE}T00:00:00.000Z`),
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];
}
