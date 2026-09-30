import Link from "next/link";
import type { ReactNode } from "react";
import JsonLd from "@/app/json-ld";
import { CalPageHero, MarketingFooter, MarketingHeader } from "@/app/marketing-shell";
import {
  createBreadcrumbJsonLd,
  createWebPageJsonLd,
  siteUrl,
} from "@/app/seo";
import type { CmsLegalPage } from "@/lib/cms/types";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return <span key={index}>{part}</span>;
    const href = match[2];
    const external = href.startsWith("http://") || href.startsWith("https://");
    if (external) {
      return (
        <a key={index} href={href} target="_blank" rel="noopener">
          {match[1]}
        </a>
      );
    }
    return (
      <Link key={index} href={href}>
        {match[1]}
      </Link>
    );
  });
}

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export function LegalPageView({ page }: { page: CmsLegalPage }) {
  const path = `/${page.slug}`;
  const jsonLd = [
    createWebPageJsonLd({
      name: page.title,
      description: page.lede || page.description,
      url: `${siteUrl}${path}`,
      dateModified: page.updatedDate,
    }),
    createBreadcrumbJsonLd([
      { name: "Home", url: siteUrl },
      { name: page.title, url: `${siteUrl}${path}` },
    ]),
  ];

  return (
    <>
      <JsonLd id={`${page.slug}-jsonld`} data={jsonLd} />
      {/* Calendly-style: cream hero with the document switcher, then one
          plain reading column. No sign-up box on legal pages. */}
      <main className="site-theme min-h-screen overflow-x-hidden">
        <MarketingHeader transparentAtTop />
        <CalPageHero title={page.title}>
          {page.updatedDate ? (
            <p className="cal-page-meta">Last updated {page.updatedDate}</p>
          ) : null}
          <nav aria-label="Legal" className="mt-6">
            <ul className="flex flex-wrap justify-center gap-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.href === path ? "page" : undefined}
                    className="cal-filter-pill inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </CalPageHero>

        <article className="site-legal-body cal-read">
          {page.lede || page.description ? <p>{page.lede || page.description}</p> : null}
          {page.sections.map((section) => (
            <section key={section.title} className="mt-8">
              <h2>{section.title}</h2>
              <p className="mt-3">{renderInline(section.body)}</p>
            </section>
          ))}
        </article>
        <MarketingFooter />
      </main>
    </>
  );
}
