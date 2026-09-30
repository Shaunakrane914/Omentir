import Link from "next/link";
import {
  MarketingTable,
  MarketingTd,
  MarketingTh,
  MarketingThead,
  MarketingTr,
} from "../marketing-table";
import type { SeoContentPage } from "../seo-content/types";
import IntegrationLogo, { IntegrationMark, integrationName } from "./integration-logo";

export default function IntegrationsDirectory({
  pages,
}: {
  pages: readonly Pick<SeoContentPage, "slug" | "title" | "summary" | "connect">[];
}) {
  return (
    <div className="space-y-14">
      {/* Logo cards, like calendly.com/integrations: mark on a tile, name,
          summary, and how it connects. */}
      <ul aria-label="Integration list" className="cal-int-grid">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link href={`/integrations/${page.slug}`} className="cal-int-card">
              <span className="cal-int-logo">
                <IntegrationMark slug={page.slug} />
              </span>
              <strong>{integrationName(page.slug)}</strong>
              <span className="cal-int-summary">{page.summary}</span>
              {page.connect ? (
                <span className="cal-int-meta">
                  <span className="cal-post-tag">{page.connect.surface}</span>
                  {page.connect.auth}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="Connect matrix">
        <h2 className="cal-read-h2">
          Connect paths
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--md-sys-color-on-surface-variant)] sm:text-base">
          Chat apps approve the workspace. Coding agents and scripts send a
          revocable API key.
        </p>
        <MarketingTable className="mt-6">
          <MarketingThead>
            <tr>
              <MarketingTh>Integration</MarketingTh>
              <MarketingTh>Surface</MarketingTh>
              <MarketingTh>Auth</MarketingTh>
              <MarketingTh>Best for</MarketingTh>
            </tr>
          </MarketingThead>
          <tbody>
            {pages.map((page) => {
              const row = page.connect;
              if (!row) return null;
              return (
                <MarketingTr key={page.slug}>
                  <MarketingTh scope="row">
                    <Link
                      href={`/integrations/${page.slug}`}
                      className="inline-flex items-center gap-3 hover:text-[var(--md-sys-color-primary)]"
                    >
                      <IntegrationLogo slug={page.slug} size="sm" />
                      {integrationName(page.slug)}
                    </Link>
                  </MarketingTh>
                  <MarketingTd>{row.surface}</MarketingTd>
                  <MarketingTd>{row.auth}</MarketingTd>
                  <MarketingTd>{row.bestFor}</MarketingTd>
                </MarketingTr>
              );
            })}
          </tbody>
        </MarketingTable>
      </section>
    </div>
  );
}
