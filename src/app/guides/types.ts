import type { SeoComparisonTable, SeoPhase, SeoThreadLine } from "../seo-content/types";

export type GuideCluster = "linkedin" | "b2b" | "email" | "general";

/** Side-by-side "weak vs strong" lists. */
export type GuideContrast = {
  badLabel: string;
  bad: string[];
  goodLabel: string;
  good: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Paste-ready prompt or other monospaced job spec. */
  code?: string;
  /** Rows compared across columns. Headers name the value columns. */
  table?: SeoComparisonTable;
  /** Numbered steps on a vertical rail. */
  steps?: SeoPhase[];
  /** Chat bubbles: what you send, what they say, drafts to approve. */
  thread?: SeoThreadLine[];
  contrast?: GuideContrast;
  /** One highlighted rule or warning. */
  callout?: string;
};

export type GuideRelated = {
  label: string;
  href: string;
};

export type GuidePage = {
  slug: string;
  title: string;
  description: string;
  query: string;
  kicker: string;
  cluster: GuideCluster;
  publishedDate: string;
  updatedDate: string;
  keywords: string[];
  /** Short answer shown in a box above the sections. */
  answer?: string;
  sections: GuideSection[];
  faqItems: GuideFaq[];
  related?: GuideRelated[];
  relatedHeading?: string;
  /** CDN hero / Open Graph image from Sanity. */
  ogImage?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

export function getGuide(pages: readonly GuidePage[], slug: string) {
  return pages.find((page) => page.slug === slug);
}
