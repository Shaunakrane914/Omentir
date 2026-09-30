import { CalLinkCards } from "../marketing-shell";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
  siteUrl,
} from "../seo";
import AlternativesDirectory from "../alternatives/alternatives-directory";
import ComparisonsDirectory from "../comparisons/comparisons-directory";
import IntegrationsDirectory from "../integrations/integrations-directory";
import UseCasesDirectory from "../use-cases/use-cases-directory";
import type { SeoContentPage, SeoFamily } from "./types";
import { liveSeoPages } from "./types";
import {
  familyCrumbs,
  familyLabels,
  familyPaths,
  SeoDocLayout,
  SeoHero,
  SeoPageChrome,
} from "./shared";

const QUIET_FAMILIES: ReadonlySet<SeoFamily> = new Set([
  "features",
  "integrations",
  "alternatives",
  "use-cases",
  "comparisons",
]);

type SeoIndexPageViewProps = {
  family: SeoFamily;
  title: string;
  description: string;
  pages: readonly SeoContentPage[];
  compactHero?: boolean;
};

export default function SeoIndexPageView({
  family,
  title,
  description,
  pages,
  compactHero = false,
}: SeoIndexPageViewProps) {
  const path = familyPaths[family];
  const pageUrl = `${siteUrl}${path}`;
  const familyLabel = familyLabels[family];
  const published = liveSeoPages(pages);
  const quiet = QUIET_FAMILIES.has(family);

  const jsonLd = [
    createWebPageJsonLd({
      name: title,
      description,
      url: pageUrl,
    }),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${pageUrl}#collection`,
      name: title,
      description,
      url: pageUrl,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: published.length,
        itemListElement: published.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}${path}/${page.slug}`,
          name: page.title,
        })),
      },
    },
    createBreadcrumbJsonLd([
      { name: "Home", url: siteUrl },
      { name: familyLabel, url: pageUrl },
    ]),
  ];

  const directory =
    family === "integrations" ? (
      <IntegrationsDirectory pages={published} />
    ) : family === "alternatives" ? (
      <AlternativesDirectory pages={published} />
    ) : family === "use-cases" ? (
      <UseCasesDirectory pages={published} />
    ) : family === "comparisons" ? (
      <ComparisonsDirectory pages={published} />
    ) : (
      <section>
        {quiet ? <h2 className="cal-read-h2 mb-6">{familyLabel}</h2> : null}
        <CalLinkCards
          links={published.map((page) => ({
            href: `${path}/${page.slug}`,
            label: page.title,
            description: page.summary,
          }))}
        />
      </section>
    );

  if (quiet) {
    return (
      <SeoPageChrome jsonLdId={`seo-${family}-index-jsonld`} jsonLd={jsonLd}>
        <SeoDocLayout
          crumbs={familyCrumbs(family)}
          title={title}
          description={description}
          path={familyPaths[family]}
          width="moderate"
        >
          {directory}
        </SeoDocLayout>
      </SeoPageChrome>
    );
  }

  return (
    <SeoPageChrome jsonLdId={`seo-${family}-index-jsonld`} jsonLd={jsonLd}>
      <SeoHero
        title={title}
        description={description}
        compact={compactHero}
        crumbs={familyCrumbs(family)}
      />
      <section className="relative z-0 mx-auto w-full max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
        {directory}
      </section>
    </SeoPageChrome>
  );
}
