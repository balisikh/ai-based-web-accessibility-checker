import { JsonLd } from "@/components/JsonLd";
import { pageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { ScanExperience } from "./ScanExperience";

export const metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd />
      <main>
        <ScanExperience />
      </main>
    </>
  );
}
