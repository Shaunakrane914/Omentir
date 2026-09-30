import JsonLd from "../json-ld";
import {
  articlePathCrumbs,
  CalLinkCards,
  CalPageHero,
  MarketingFooter,
  MarketingHeader,
} from "../marketing-shell";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createWebPageJsonLd,
  siteUrl,
} from "../seo";
import { getHelpPages, groupedHelp, liveSeoPages } from "@/lib/cms";
import SquircleIcon from "../squircle-icon";
import { CLUSTER_ICON, HELP_CLUSTER_LABELS } from "./types";


const title = "LinkedIn outreach help";
const description =
  "Short answers to the LinkedIn outreach, cold messaging, cold email, and B2B sales questions people actually ask.";

export const metadata = createPageMetadata({
  title,
  description,
  path: "/help",
  keywords: [
    "LinkedIn outreach help",
    "LinkedIn connection request limits",
    "cold email reply rate",
    "LinkedIn InMail",
    "B2B sales questions",
  ],
});

export default async function HelpIndexPage() {
  const pages = liveSeoPages(await getHelpPages());
  const pageUrl = `${siteUrl}/help`;
  const groups = groupedHelp(pages);
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
        numberOfItems: pages.length,
        itemListElement: pages.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/help/${page.slug}`,
          name: page.question,
        })),
      },
    },
    createBreadcrumbJsonLd([
      { name: "Home", url: siteUrl },
      { name: "Help", url: pageUrl },
    ]),
  ];

  return (
    <>
      <JsonLd id="help-index-jsonld" data={jsonLd} />
      <main className="site-theme min-h-screen overflow-x-hidden">
        <MarketingHeader transparentAtTop />
        <CalPageHero
          crumbs={articlePathCrumbs("help")}
          title={title}
          description={`${description} Each page is one question. The extra detail sits in the FAQ under the answer.`}
        />
        <div className="cal-read cal-read-wide space-y-14 md:space-y-16">
          <nav aria-label="Browse by topic">
            <ul className="cal-topic-grid">
              {groups.map((group) => {
                const [icon, tone] = CLUSTER_ICON[group.cluster];
                return (
                  <li key={group.cluster}>
                    <a href={`#${group.cluster}`} className="cal-topic-card">
                      <SquircleIcon icon={icon} tone={tone} size={40} />
                      <strong>{HELP_CLUSTER_LABELS[group.cluster]}</strong>
                      <span>
                        {group.pages.length} {group.pages.length === 1 ? "question" : "questions"}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          {groups.map((group) => (
            <section key={group.cluster} id={group.cluster} className="scroll-mt-28">
              <h2 className="cal-read-h2 flex items-center gap-3">
                <SquircleIcon icon={CLUSTER_ICON[group.cluster][0]} tone={CLUSTER_ICON[group.cluster][1]} size={32} />
                {HELP_CLUSTER_LABELS[group.cluster]}
              </h2>
              <div className="mt-6">
                <CalLinkCards
                  links={group.pages.map((page) => ({ href: `/help/${page.slug}`, label: page.question }))}
                />
              </div>
            </section>
          ))}
        </div>
        <MarketingFooter />
      </main>
    </>
  );
}
