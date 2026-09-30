import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { hostedGithubRepo } from "@/lib/hosted-identity";
import { AskAiMenu } from "./ask-ai-menu";
import FeatureMenu from "./feature-menu";
import GithubStarButton from "./github-star-button";
import HeaderAuth from "./header-auth";
import LogoMark from "./logo-mark";
import MarketingHeaderFrame from "./marketing-header-frame";
import MarketingFooter from "./marketing-footer";
import { MarketingMobileMenuButton } from "./marketing-mobile-nav";

export { MarketingFooter };

/** `cal-site` marks a marketing page: while it is mounted, globals.css swaps
 *  the site palette for the marketing theme (see the Calendly-style block). */
export function MarketingHeader({ transparentAtTop = false }: { transparentAtTop?: boolean }) {
  return (
    <div className="cal-site cal-header">
      <MarketingHeaderFrame transparentAtTop={transparentAtTop}>
        {/* Width + gutters from .omentir-primary-width.
            Desktop: logo | nav centered in full header | actions */}
        <header className="omentir-primary-width relative flex h-[52px] min-w-0 items-center gap-2 md:gap-4">
          <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
            <Link
              href="/"
              className="flex min-w-0 shrink-0 select-none items-center gap-1.5 text-[18px] font-medium leading-none tracking-tight text-[var(--md-sys-color-on-surface)] md:gap-2 md:text-[20px]"
            >
              <LogoMark className="h-5 w-5 md:h-6 md:w-6" />
              <span className="truncate">Omentir</span>
            </Link>
            {/* Remote GitHub data is cosmetic. Render the link immediately so a
                slow API response cannot hold back the entire landing header. */}
            <Suspense fallback={<GithubStarButtonFallback />}>
              <GithubStarButton />
            </Suspense>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm font-normal text-[var(--md-sys-color-on-surface)] md:flex lg:absolute lg:left-1/2 lg:flex-none lg:-translate-x-1/2">
            <FeatureMenu />
            <Link href="/integrations" className="site-nav-link">Integrations</Link>
            <Link href="/pricing" className="site-nav-link">Pricing</Link>
            <AskAiMenu />
          </nav>

          {/* ml-auto keeps actions on the right: on mobile the nav is hidden, and on lg
              the nav is absolutely centered (out of flex flow), so nothing else pushes right */}
          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 md:gap-2">
            {/* Desktop: auth CTAs */}
            <div className="hidden items-center gap-2 md:flex">
              {/* Session resolution is allowed to finish after the usable header
                  has streamed. Signed-out CTAs are the safe initial fallback. */}
              <Suspense fallback={<HeaderAuthFallback />}>
                <HeaderAuth />
              </Suspense>
            </div>
            {/* Mobile: hamburger on the right → full-screen menu (icon becomes close) */}
            <MarketingMobileMenuButton />
          </div>
        </header>
      </MarketingHeaderFrame>
    </div>
  );
}

function GithubStarButtonFallback() {
  return (
    <a
      href={`https://github.com/${hostedGithubRepo()}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Omentir on GitHub"
      className="m3-state-layer inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-[var(--md-sys-color-outline-variant)] px-[9px] py-[5px] text-[11px] font-medium leading-none text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-on-surface)] md:gap-1.5 md:px-[11px] md:py-[7px] md:text-[13px]"
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 fill-current md:h-4 md:w-4"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    </a>
  );
}

function HeaderAuthFallback() {
  return (
    <>
      <Link href="/login" className="site-btn site-btn-sm site-btn-outline">
        Sign in
      </Link>
      <Link href="/demo" className="site-btn site-btn-sm site-btn-outline">
        Book a demo
      </Link>
      <Link href="/signup" className="site-btn site-btn-sm site-btn-primary">
        Get started
      </Link>
    </>
  );
}

type MarketingPageProps = {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  centeredHeader?: boolean;
  contentClassName?: string;
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
  heroFullHeight?: boolean;
  heroActions?: React.ReactNode;
  children: React.ReactNode;
};

export function MarketingPage({
  title,
  description,
  centeredHeader = false,
  contentClassName = "max-w-5xl",
  titleClassName = "",
  titleStyle,
  heroFullHeight = false,
  heroActions,
  children,
}: MarketingPageProps) {
  const header = (
    <>
      {/* Same hero type as the landing page (globals.css): identical face,
          weight, tracking and mobile step. These titles are full sentences, so
          they take the -sentence display step from md up. */}
      <h1
        style={titleStyle}
        className={`hero-display-sentence text-[var(--md-sys-color-on-surface)] ${
          centeredHeader ? "mx-auto max-w-4xl text-center" : "max-w-4xl"
        } ${titleClassName}`}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={`hero-lede mt-4 max-w-2xl text-[var(--md-sys-color-on-surface-variant)] md:mt-5 ${
            centeredHeader ? "mx-auto text-center" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
      {heroActions ? (
        <div className={`mt-8 ${centeredHeader ? "flex justify-center" : ""}`}>
          {heroActions}
        </div>
      ) : null}
    </>
  );

  return (
    <main className="site-theme min-h-screen overflow-x-hidden">
      <MarketingHeader transparentAtTop />
      {heroFullHeight ? (
        <div className="relative">
          <section
            className={`relative z-10 mx-auto flex min-h-[100svh] w-full ${contentClassName} min-w-0 flex-col justify-center px-4 pt-14 pb-16 md:px-8`}
          >
            {header}
          </section>
          <section
            className={`relative z-10 mx-auto w-full ${contentClassName} min-w-0 px-4 pb-16 md:px-8 md:pb-24`}
          >
            {children}
          </section>
        </div>
      ) : (
        <div className="relative">
          <section
            className={`relative z-10 mx-auto w-full ${contentClassName} min-w-0 px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32`}
          >
            {header}
            <div className="mt-10 md:mt-12">{children}</div>
          </section>
        </div>
      )}
      <MarketingFooter />
    </main>
  );
}

export type ArticleCrumb = { label: string; href?: string };

/** Visible path crumbs. Labels stay lowercase: home / help / slug. */
export function articlePathCrumbs(...parts: string[]): ArticleCrumb[] {
  const crumbs: ArticleCrumb[] = [{ label: "home", href: "/" }];
  let acc = "";
  parts.forEach((part, index) => {
    acc += `/${part}`;
    crumbs.push(index === parts.length - 1 ? { label: part } : { label: part, href: acc });
  });
  return crumbs;
}

export function ArticleCrumbs({
  crumbs,
  className = "mb-8",
}: {
  crumbs: ReadonlyArray<ArticleCrumb>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-2 text-sm lowercase text-[var(--md-sys-color-on-surface-variant)] ${className}`}
    >
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? (
            <span className="font-normal text-[var(--md-sys-color-outline)]" aria-hidden="true">
              /
            </span>
          ) : null}
          {crumb.href ? (
            <Link href={crumb.href} className="transition-colors hover:text-[var(--md-sys-color-on-surface)]">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-[var(--md-sys-color-on-surface)]">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Calendly-style top for inner marketing pages: the homepage's cream panel
 *  with crumbs, a display title, an optional lede and extra content (meta
 *  line, actions) below. */
export function CalPageHero({
  crumbs,
  title,
  description,
  children,
  leading,
  plain = false,
}: {
  crumbs?: ReadonlyArray<ArticleCrumb>;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Shown above the title (a topic chip, for example). */
  leading?: ReactNode;
  /** No cream panel: the title sits on the page (blog index). */
  plain?: boolean;
}) {
  return (
    <section className={`cal-hero cal-page-hero${plain ? " cal-page-hero-plain" : ""}`}>
      <div className="cal-page-hero-inner">
        {crumbs && crumbs.length > 0 ? (
          <ArticleCrumbs crumbs={crumbs} className="mb-6 justify-center" />
        ) : null}
        {leading}
        <h1 className="cal-page-title">{title}</h1>
        {description ? <p className="cal-lead">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}

/** Link list shown as rounded cards (related pages, directories). */
export function CalLinkCards({
  links,
}: {
  links: ReadonlyArray<{ href: string; label: ReactNode; description?: ReactNode }>;
}) {
  return (
    <ul className="cal-link-cards">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="cal-link-card">
            <span className="min-w-0">
              <strong>{link.label}</strong>
              {link.description ? <small>{link.description}</small> : null}
            </span>
            <span aria-hidden="true" className="cal-link-card-arrow">
              &rarr;
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Closing sign-up panel at the end of articles, help and blog posts. */
export function CalCtaPanel() {
  return (
    <div className="cal-cta-panel">
      <p className="cal-read-h2">Run the outreach from your own LinkedIn account</p>
      <p className="cal-lead">
        Omentir finds ICP-fit buyers, drafts connection notes and messages, and keeps
        replies in one inbox. You still choose the daily send limits.
      </p>
      <Link href="/signup" className="site-btn site-btn-primary mt-8">
        Try Omentir
      </Link>
    </div>
  );
}

/** Narrow article chrome shared with /help pages. */
export function MarketingArticle({
  title,
  path,
  crumbs,
  description,
  updated,
  children,
}: {
  title: string;
  path: string;
  crumbs?: ReadonlyArray<ArticleCrumb>;
  description?: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  const trail = crumbs ?? articlePathCrumbs(path);
  return (
    <main className="site-theme min-h-screen overflow-x-hidden">
      <MarketingHeader transparentAtTop />
      <CalPageHero crumbs={trail} title={title} description={description}>
        {updated ? <p className="cal-page-meta">Last updated {updated}</p> : null}
      </CalPageHero>
      <article className="cal-read">
        {children}
        <CalCtaPanel />
      </article>
      <MarketingFooter />
    </main>
  );
}
