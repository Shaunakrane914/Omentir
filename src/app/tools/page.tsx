import Link from "next/link";
import JsonLd from "../json-ld";
import {
  articlePathCrumbs,
  CalPageHero,
  MarketingFooter,
  MarketingHeader,
} from "../marketing-shell";
import { MarkdownTwinLink } from "../seo-content/shared";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  siteUrl,
} from "../seo";
import { ALL_TOOLS, TOOLS_INDEX } from "./tools-data";

export const metadata = createPageMetadata({
  title: `${TOOLS_INDEX.title} - Omentir`,
  description: TOOLS_INDEX.description,
  path: TOOLS_INDEX.path,
  keywords: [
    "free lead finder",
    "free LinkedIn profile tools",
    "LinkedIn profile rating",
    "improve LinkedIn profile",
    "no login LinkedIn review",
  ],
});

export default function ToolsIndexPage() {
  const pageUrl = `${siteUrl}${TOOLS_INDEX.path}`;
  const jsonLd = [
    createWebPageJsonLd({
      name: TOOLS_INDEX.title,
      description: TOOLS_INDEX.description,
      url: pageUrl,
    }),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${pageUrl}#collection`,
      name: TOOLS_INDEX.title,
      description: TOOLS_INDEX.description,
      url: pageUrl,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteUrl}/#website` },
      publisher: { "@id": `${siteUrl}/#organization` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: ALL_TOOLS.length,
        itemListElement: ALL_TOOLS.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}${tool.href}`,
          name: tool.title,
        })),
      },
    },
    createBreadcrumbJsonLd([
      { name: "Home", url: siteUrl },
      { name: "Tools", url: pageUrl },
    ]),
  ];

  return (
    <>
      <JsonLd id="tools-index-jsonld" data={jsonLd} />
      <main className="site-theme min-h-screen overflow-x-hidden">
        <MarketingHeader transparentAtTop />
        <CalPageHero
          crumbs={articlePathCrumbs("tools")}
          title={TOOLS_INDEX.title}
          description={TOOLS_INDEX.lede}
        />
        <div className="cal-read">
          <ul className="grid gap-3">
            {ALL_TOOLS.map((tool, index) => (
              <li key={tool.slug}>
                <Link href={tool.href} className="cal-link-card !justify-start !gap-4 !p-6">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--cal-blue-soft)] text-sm font-semibold tabular-nums text-[var(--cal-blue)]">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <h2 className="text-xl font-medium tracking-tight">{tool.title}</h2>
                    <small>{tool.summary}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <MarkdownTwinLink path={TOOLS_INDEX.path} title={TOOLS_INDEX.title} />
        </div>
        <MarketingFooter />
      </main>
    </>
  );
}
