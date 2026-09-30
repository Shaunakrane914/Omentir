import Link from "next/link";
import Compose from "../compose";
import { IntegrationMark, integrationName } from "../integrations/integration-logo";
import LogoMark from "../logo-mark";
import { CalPageHero } from "../marketing-shell";
import {
  CtaBlock,
  familyCrumbs,
  FaqBlock,
  MarkdownTwinLink,
  pageJsonLd,
  RelatedLinks,
  SectionProse,
  SeoPageChrome,
  SetupSteps,
} from "./shared";
import { type SeoContentPage } from "./types";

const ENDPOINTS = [
  { label: "MCP", value: "https://omentir.com/api/agent/v1/mcp" },
  { label: "REST", value: "https://omentir.com/api/agent/v1/*" },
];

/** Integration page laid out like calendly.com/integration/*: "Omentir + X"
 *  hero with both marks, then a sticky facts card beside the story. */
export default function IntegrationPageView({ page }: { page: SeoContentPage }) {
  const compose = page.slug === "claude-code";
  const name = integrationName(page.slug);
  const primary = page.primaryCta ?? { label: "Start with Omentir", href: "/signup" };
  const facts = [
    page.connect?.surface ? { label: "Connects through", value: page.connect.surface } : null,
    page.connect?.auth ? { label: "Sign-in", value: page.connect.auth } : null,
    page.connect?.bestFor ? { label: "Best for", value: page.connect.bestFor } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <SeoPageChrome
      jsonLdId={`seo-integrations-${page.slug}-jsonld`}
      jsonLd={pageJsonLd("integrations", page)}
    >
      <Compose enabled={compose}>
        <CalPageHero
          crumbs={familyCrumbs("integrations", page.slug)}
          leading={
            <div className="cal-pair mb-6" aria-hidden="true">
              <span className="cal-pair-tile">
                <LogoMark className="h-7 w-7" />
              </span>
              <span className="cal-pair-plus">+</span>
              <span className="cal-pair-tile">
                <IntegrationMark slug={page.slug} />
              </span>
            </div>
          }
          title={page.title}
          description={page.summary}
        >
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href={primary.href} className="site-btn site-btn-primary w-full sm:w-auto">
              {primary.label}
            </Link>
            {page.setupSteps ? (
              <a href="#setup-steps" className="site-btn site-btn-outline w-full sm:w-auto">
                See setup
              </a>
            ) : null}
          </div>
        </CalPageHero>

        <div className="cal-side-layout">
          <aside className="cal-facts">
            <p className="cal-facts-title">
              <span className="cal-facts-mark">
                <IntegrationMark slug={page.slug} />
              </span>
              {name}
            </p>
            <dl>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
              <div>
                <dt>Endpoints</dt>
                {ENDPOINTS.map((endpoint) => (
                  <dd key={endpoint.label} className="cal-facts-code">
                    <span>{endpoint.label}</span>
                    {endpoint.value}
                  </dd>
                ))}
              </div>
            </dl>
            <Link href="/agents.md" className="cal-underline-link mt-5">
              Agent guide <span aria-hidden="true">&rarr;</span>
            </Link>
          </aside>

          <article className="min-w-0 space-y-14 md:space-y-16">
            {page.setupSteps ? <SetupSteps steps={page.setupSteps} /> : null}
            <SectionProse page={page} />
            {page.relatedLinks ? <RelatedLinks links={page.relatedLinks} /> : null}
            <FaqBlock page={page} branded />
            <CtaBlock
              page={page}
              boxed
              title="Connect your operator to a real sales workspace"
              body="Omentir holds the LinkedIn connection and safety limits. Your AI configures agents and inspects results."
            />
            <MarkdownTwinLink path={`/integrations/${page.slug}`} title={page.title} />
          </article>
        </div>
      </Compose>
    </SeoPageChrome>
  );
}
