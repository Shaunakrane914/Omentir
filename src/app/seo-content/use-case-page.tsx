import {
  HighlightStrip,
  TimelineWeeks,
  VerdictBanner,
} from "./layouts";
import {
  CtaBlock,
  familyCrumbs,
  FaqBlock,
  pageJsonLd,
  RelatedLinks,
  SectionProse,
  SeoDocLayout,
  SeoPageChrome,
} from "./shared";
import { type SeoContentPage } from "./types";

export default function UseCasePageView({ page }: { page: SeoContentPage }) {

  return (
    <SeoPageChrome
      jsonLdId={`seo-use-cases-${page.slug}-jsonld`}
      jsonLd={pageJsonLd("use-cases", page)}
    >
      <SeoDocLayout
        as="article"
        crumbs={familyCrumbs("use-cases", page.slug)}
        title={page.title}
        path={`/use-cases/${page.slug}`}
      >
        {page.highlights ? <HighlightStrip items={page.highlights} /> : null}
        <VerdictBanner page={page} />
        {page.phases ? (
          <section id="first-weeks">
            <h2 className="cal-read-h2">
              First weeks
            </h2>
            <div className="mt-6">
              <TimelineWeeks phases={page.phases} />
            </div>
          </section>
        ) : null}
        <SectionProse page={page} />
        {page.relatedLinks ? <RelatedLinks links={page.relatedLinks} /> : null}
        <FaqBlock page={page} branded />
        <CtaBlock
          page={page}
          boxed
          title={page.ctaTitle ?? "Run this motion on one LinkedIn account"}
          body={
            page.ctaBody ??
            "Connect LinkedIn, fill Workspace, and measure replies before you add volume."
          }
        />
      </SeoDocLayout>
    </SeoPageChrome>
  );
}
