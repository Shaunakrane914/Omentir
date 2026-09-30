import type { FeatureNavIcon } from "../feature-nav";
import type { SquircleTone } from "../squircle-icon";
export type HelpCluster =
  | "limits"
  | "profile"
  | "requests"
  | "messages"
  | "inmail"
  | "targeting"
  | "email"
  | "rules";

export type HelpFaq = {
  question: string;
  answer: string;
};

export type HelpRelated = {
  label: string;
  href: string;
};

export type HelpPageDraft = {
  slug: string;
  question: string;
  description: string;
  keywords: string[];
  cluster: HelpCluster;
  publishedDate: string;
  updatedDate: string;
  paragraphs: string[];
  /** Paste-ready Grok Bot (or similar) job spec shown after the answer. */
  prompt?: string;
  faqItems: HelpFaq[];
  relatedSlugs: string[];
};

export type HelpPage = Omit<HelpPageDraft, "relatedSlugs"> & {
  related: HelpRelated[];
};

/** Icon and tone per topic: help index tiles and article heroes. */
export const CLUSTER_ICON: Record<HelpCluster, [FeatureNavIcon, SquircleTone]> = {
  limits: ["shield", "blue"],
  profile: ["people", "lavender"],
  requests: ["network", "lime"],
  messages: ["message", "mint"],
  inmail: ["inbox", "orange"],
  targeting: ["target", "blue"],
  email: ["send", "lavender"],
  rules: ["product", "lime"],
};

export const HELP_CLUSTER_LABELS: Record<HelpCluster, string> = {
  limits: "Limits and account health",
  profile: "Profile and presence",
  requests: "Connection requests",
  messages: "Messages and follow-ups",
  inmail: "InMail, Premium, and Sales Navigator",
  targeting: "Targeting and B2B sales",
  email: "Cold email",
  rules: "Rules and tools",
};

export const HELP_CLUSTER_ORDER: HelpCluster[] = [
  "limits",
  "profile",
  "requests",
  "messages",
  "inmail",
  "targeting",
  "email",
  "rules",
];
