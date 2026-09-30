import Link from "next/link";
import { CalLinkCards, CalPageHero, MarketingFooter, MarketingHeader } from "./marketing-shell";
import { createPageMetadata } from "./seo";

export const metadata = createPageMetadata({
  title: "Page not found - Omentir",
  description: "The page you are looking for does not exist or has moved.",
  noIndex: true,
});

/** Where a lost visitor most likely wanted to go. */
const DESTINATIONS = [
  { href: "/features", label: "Features", description: "Lead finders, AI outreach, the inbox and more" },
  { href: "/integrations", label: "Integrations", description: "Run Omentir from Claude, ChatGPT, Cursor or code" },
  { href: "/pricing", label: "Pricing", description: "Plans and the booking guarantee" },
  { href: "/help", label: "Help", description: "Short answers to LinkedIn outreach questions" },
];

/* Same chrome as the other inner pages: the cream hero panel, then link
   cards on the page, then the footer. */
export default function NotFound() {
  return (
    <main className="site-theme min-h-screen overflow-x-clip">
      <MarketingHeader transparentAtTop />

      <CalPageHero
        leading={<span className="cal-post-tag mb-6">Error 404</span>}
        title="This page wandered off."
        description="The page you are looking for does not exist, may have moved, or the link was mistyped. Let's get you back to finding customers."
      >
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/" className="site-btn site-btn-primary">
            Back to home
          </Link>
          <Link href="/blogs" className="site-btn site-btn-outline">
            Read the blog
          </Link>
        </div>
      </CalPageHero>

      <div className="cal-read">
        <CalLinkCards links={DESTINATIONS} />
      </div>

      <MarketingFooter />
    </main>
  );
}
