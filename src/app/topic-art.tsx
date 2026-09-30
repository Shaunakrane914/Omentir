import type { ReactNode } from "react";
import type { FeatureNavIcon } from "./feature-nav";

/* Minimal topic illustrations on a square pastel card, in the soft-shape
   style of the homepage step cards: two or three rounded shapes, a light
   gradient, no text. Colours come from the theme's --cal-art-* tokens so
   the art follows light and dark mode. */

export type ArtTint = "blue" | "mint" | "lavender" | "lime" | "peach";
type Tint = ArtTint;

const ART: Record<FeatureNavIcon, { ground: Tint; accent: Tint; shapes: (g: string, a: string) => ReactNode }> = {
  search: {
    ground: "blue",
    accent: "mint",
    shapes: (g, a) => (
      <>
        <circle cx="88" cy="86" r="44" fill="none" stroke={`url(#${g})`} strokeWidth="24" />
        <rect x="118" y="116" width="26" height="62" rx="13" transform="rotate(-45 131 147)" fill={`url(#${a})`} />
      </>
    ),
  },
  send: {
    ground: "lavender",
    accent: "blue",
    shapes: (g, a) => (
      <>
        <path d="M34 98 166 40 124 164 100 116Z" fill={`url(#${g})`} />
        <path d="M100 116 166 40 118 130Z" fill={`url(#${a})`} />
      </>
    ),
  },
  network: {
    ground: "mint",
    accent: "blue",
    shapes: (g, a) => (
      <>
        <path d="M70 76 136 66M70 76 104 140M136 66 104 140" stroke={`url(#${a})`} strokeWidth="10" strokeLinecap="round" />
        <circle cx="70" cy="76" r="30" fill={`url(#${g})`} />
        <circle cx="136" cy="66" r="24" fill={`url(#${a})`} />
        <circle cx="104" cy="140" r="28" fill={`url(#${g})`} />
      </>
    ),
  },
  message: {
    ground: "lavender",
    accent: "peach",
    shapes: (g, a) => (
      <>
        <path d="M28 82a32 32 0 0 1 32-32h66a32 32 0 0 1 0 64H62l-26 20 5-26a32 32 0 0 1-13-26Z" fill={`url(#${g})`} />
        <path d="M172 136a28 28 0 0 0-28-28H88a28 28 0 0 0 0 56h58l22 16-4-22a28 28 0 0 0 8-22Z" fill={`url(#${a})`} />
      </>
    ),
  },
  inbox: {
    ground: "mint",
    accent: "blue",
    shapes: (g, a) => (
      <>
        <rect x="62" y="34" width="76" height="48" rx="14" fill={`url(#${a})`} opacity="0.7" />
        <rect x="50" y="56" width="100" height="52" rx="16" fill={`url(#${g})`} />
        <path d="M30 116h40l10 18h40l10-18h40v34a22 22 0 0 1-22 22H52a22 22 0 0 1-22-22Z" fill={`url(#${a})`} />
      </>
    ),
  },
  target: {
    ground: "peach",
    accent: "lavender",
    shapes: (g, a) => (
      <>
        <circle cx="100" cy="100" r="72" fill={`url(#${a})`} />
        <circle cx="100" cy="100" r="52" style={{ fill: "var(--cal-art-glow)" }} />
        <circle cx="100" cy="100" r="34" fill={`url(#${g})`} />
        <circle cx="100" cy="100" r="14" style={{ fill: "var(--cal-art-glow)" }} />
      </>
    ),
  },
  shield: {
    ground: "lime",
    accent: "mint",
    shapes: (g, a) => (
      <>
        <path d="M100 28 158 50v48c0 38-26 64-58 76-32-12-58-38-58-76V50Z" fill={`url(#${g})`} />
        <path d="M100 28 158 50v48c0 38-26 64-58 76Z" fill={`url(#${a})`} opacity="0.75" />
      </>
    ),
  },
  people: {
    ground: "lavender",
    accent: "blue",
    shapes: (g, a) => (
      <>
        <circle cx="130" cy="70" r="20" fill={`url(#${a})`} />
        <path d="M100 150a30 30 0 0 1 60 0v10h-60Z" fill={`url(#${a})`} />
        <circle cx="80" cy="76" r="26" fill={`url(#${g})`} />
        <path d="M38 166a42 42 0 0 1 84 0v6H38Z" fill={`url(#${g})`} />
      </>
    ),
  },
  product: {
    ground: "lime",
    accent: "blue",
    shapes: (g, a) => (
      <>
        <path d="M100 34 162 66 100 98 38 66Z" fill={`url(#${g})`} />
        <path d="M38 66 100 98v70L38 136Z" fill={`url(#${a})`} />
        <path d="M162 66 100 98v70l62-32Z" fill={`url(#${a})`} opacity="0.6" />
      </>
    ),
  },
  code: {
    ground: "blue",
    accent: "lavender",
    shapes: (g, a) => (
      <>
        <path d="M76 58 34 100l42 42M124 58l42 42-42 42" fill="none" stroke={`url(#${g})`} strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M112 44 88 156" stroke={`url(#${a})`} strokeWidth="18" strokeLinecap="round" />
      </>
    ),
  },
};

/** Square illustration card. `id` must be unique per page (gradient ids). */
export default function TopicArt({
  icon,
  id,
  size = "md",
  ground,
  className = "",
}: {
  icon: FeatureNavIcon;
  id: string;
  /** Overrides the topic's own ground colour (blog cards vary it per post). */
  ground?: ArtTint;
  size?: "sm" | "md" | "lg" | "fill";
  className?: string;
}) {
  const art = ART[icon] ?? ART.product;
  const g = `${id}-g`;
  const a = `${id}-a`;
  return (
    <span className={`cal-art is-${size} ${className}`} data-ground={ground ?? art.ground} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id={g} cx="0.3" cy="0.2" r="1">
            <stop offset="0" style={{ stopColor: "var(--cal-art-glow)" }} />
            <stop offset="1" style={{ stopColor: `var(--cal-art-${art.ground}-deep)` }} />
          </radialGradient>
          <radialGradient id={a} cx="0.3" cy="0.2" r="1">
            <stop offset="0" style={{ stopColor: "var(--cal-art-glow)" }} />
            <stop offset="1" style={{ stopColor: `var(--cal-art-${art.accent}-deep)` }} />
          </radialGradient>
        </defs>
        {art.shapes(g, a)}
      </svg>
    </span>
  );
}
