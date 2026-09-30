import Link from "next/link";
import { CalPageHero } from "../marketing-shell";
import SquircleIcon from "../squircle-icon";
import { HighlightStrip, PhaseCalendar, ThreadPreview } from "./layouts";
import {
  CtaBlock,
  familyCrumbs,
  FaqBlock,
  MarkdownTwinLink,
  pageJsonLd,
  RelatedLinks,
  SectionBody,
  SeoPageChrome,
  SetupSteps,
} from "./shared";
import { type SeoContentPage, type SeoSection } from "./types";

/* Feature pages read as a product page, not an article: a centred hero
   like the integration pages, then the sections as a bento. The
   first section is the lead, "first-week" is a highlighted band, "not-for"
   a caution card, and everything between is a numbered card. */
const FIRST_WEEK = "first-week";
const NOT_FOR = "not-for";

export default function FeaturePageView({ page }: { page: SeoContentPage }) {
  const path = `/features/${page.slug}`;
  const primary = page.primaryCta ?? { label: "Start with Omentir", href: "/signup" };

  const [lead, ...rest] = page.sections;
  const firstWeek = rest.find((section) => section.id === FIRST_WEEK);
  const notFor = rest.find((section) => section.id === NOT_FOR);
  const middle = rest.filter((section) => section !== firstWeek && section !== notFor);

  return (
    <SeoPageChrome jsonLdId={`seo-features-${page.slug}-jsonld`} jsonLd={pageJsonLd("features", page)}>
      <CalPageHero
        crumbs={familyCrumbs("features", page.slug)}
        title={page.title}
        description={page.summary}
      >
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link href={primary.href} className="site-btn site-btn-primary w-full sm:w-auto">
            {primary.label}
          </Link>
          {lead ? (
            <a href={`#${lead.id}`} className="site-btn site-btn-outline w-full sm:w-auto">
              How it works
            </a>
          ) : null}
        </div>
      </CalPageHero>

      <div className="cal-read cal-read-wide">
        <article className="space-y-6">
          {lead ? (
            <section id={lead.id} className="cal-bento-lead scroll-mt-28">
              <h2 className="cal-read-h2">{lead.heading}</h2>
              <GistBody section={lead} lead />
            </section>
          ) : null}

          {page.layout && page.highlights ? <HighlightStrip items={page.highlights} /> : null}
          {page.thread ? <ThreadPreview lines={page.thread} /> : null}
          {page.phases ? <PhaseCalendar phases={page.phases} /> : null}
          {page.setupSteps ? <SetupSteps steps={page.setupSteps} /> : null}

          {middle.length ? (
            <div className="cal-bento">
              {middle.map((section, index) => (
                <BentoCard key={section.id} section={section} index={index} />
              ))}
            </div>
          ) : null}

          {firstWeek ? (
            <section id={firstWeek.id} className="cal-bento-band scroll-mt-28">
              <SquircleIcon icon="send" tone="blue" size={40} />
              <div className="min-w-0">
                <h2 className="cal-read-h2">{firstWeek.heading}</h2>
                <GistBody section={firstWeek} />
              </div>
            </section>
          ) : null}

          {notFor ? (
            <section id={notFor.id} className="cal-bento-card is-caution scroll-mt-28">
              <span className="cal-bento-num" aria-hidden="true">
                !
              </span>
              <h2>{notFor.heading}</h2>
              <GistBody section={notFor} />
            </section>
          ) : null}
        </article>

        <div className="mx-auto mt-16 max-w-[44rem] space-y-14 md:mt-20 md:space-y-16">
          {page.relatedLinks ? <RelatedLinks links={page.relatedLinks} /> : null}
          <FaqBlock page={page} branded />
          <CtaBlock
            page={page}
            boxed
            title="Run this on the LinkedIn account you already use"
            body="Connect LinkedIn, fill Workspace, and try the motion in one place."
          />
          <MarkdownTwinLink path={path} title={page.title} />
        </div>
      </div>
    </SeoPageChrome>
  );
}

function BentoCard({ section, index }: { section: SeoSection; index: number }) {
  return (
    <section id={section.id} className="cal-bento-card scroll-mt-28">
      <span className="cal-bento-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h2>{section.heading}</h2>
      <GistBody section={section} />
    </section>
  );
}

/** First sentence of a section's text, and whatever follows it. */
function splitGist(paragraphs: string[]) {
  const [first = "", ...others] = paragraphs;
  const match = first.match(/^([\s\S]+?[.!?])(\s+[\s\S]+)?$/);
  const gist = match ? match[1] : first;
  const remainder = match?.[2]?.trim();
  return { gist, rest: remainder ? [remainder, ...others] : others };
}

/* Read less, learn the same: each section shows its first sentence (the
   point) and any checklist; the rest of the prose and prompt boxes fold
   under "Read more". Folded text stays in the page for search. */
function GistBody({ section, lead = false }: { section: SeoSection; lead?: boolean }) {
  const { gist, rest } = splitGist(section.paragraphs);
  const hasMore = rest.length > 0 || Boolean(section.code);
  return (
    <div className="mt-3">
      <SectionBody
        id={`${section.id}-gist`}
        paragraphs={[gist]}
        bullets={section.bullets}
        className={lead ? "cal-gist is-lead" : "cal-gist"}
      />
      {hasMore ? (
        <details className="cal-more">
          <summary>Read more</summary>
          <SectionBody
            id={section.id}
            paragraphs={rest}
            code={section.code}
            className="mt-3 leading-7 text-[var(--cal-muted)]"
          />
        </details>
      ) : null}
    </div>
  );
}
