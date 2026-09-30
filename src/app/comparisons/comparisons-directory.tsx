import type { SeoContentPage } from "../seo-content/types";
import { SeoTitleList } from "../seo-content/shared";

export default function ComparisonsDirectory({
  pages,
}: {
  pages: readonly SeoContentPage[];
}) {
  return (
    <section aria-label="Comparison list">
      <h2 className="cal-read-h2">
        Comparisons
      </h2>
      <SeoTitleList
        items={pages.map((page) => ({
          href: `/comparisons/${page.slug}`,
          label: page.title,
        }))}
      />
    </section>
  );
}
