import { JsonLd } from "@/components/JsonLd";
import { getBatchSnapshot } from "@/lib/batch-snapshot-store";
import { pageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { ScanExperience } from "./ScanExperience";

export const metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = await getBatchSnapshot();

  return (
    <>
      <JsonLd />
      <main>
        <ScanExperience
          batchSnapshot={{
            date: snapshot.date,
            meta: snapshot.meta,
            summary: snapshot.summary,
          }}
        />
      </main>
    </>
  );
}
