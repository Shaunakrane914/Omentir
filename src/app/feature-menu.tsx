import Link from "next/link";
import FeatureIcon from "./feature-icon";
import { FEATURE_NAV_ITEMS } from "./feature-nav";
import SquircleIcon, { type SquircleTone } from "./squircle-icon";

/** The five features that get an icon tile and a one-line note; every other
 *  feature is listed under Platform. */
const PRIMARY_NOTES: Record<string, string> = {
  "/features/steal-customers": "Reach your competitors' audience",
  "/features/ai-linkedin-outreach": "Messages written for each lead",
  "/features/lead-finders": "Buyers that match your profile",
  "/features/unified-inbox": "Every reply in one place",
  "/features/agent-api-and-mcp": "Run Omentir from your AI tools",
};

const TONES: SquircleTone[] = ["blue", "lime", "lavender", "orange", "mint"];

const primary = FEATURE_NAV_ITEMS.filter((item) => item.href in PRIMARY_NOTES);
const platform = FEATURE_NAV_ITEMS.filter((item) => !(item.href in PRIMARY_NOTES));

/** Desktop feature navigation: main features with notes on the left,
 *  the rest of the platform as a plain list on the right. */
export default function FeatureMenu() {
  return (
    <div className="nav-menu group relative">
      <button
        type="button"
        aria-haspopup="true"
        className="nav-menu-trigger m3-state-layer flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 transition-colors hover:text-[var(--md-sys-color-on-surface)]"
      >
        Features
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {/* Narrow bridge under the trigger only, so the pointer can reach the
          panel without a hover trap covering Integrations / Ask AI. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full h-3 group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
      />
      <div className="invisible pointer-events-none absolute left-0 top-full z-[120] w-[min(38rem,calc(100vw-2rem))] lg:left-1/2 lg:-translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] duration-150 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="nav-menu-panel grid scale-95 grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] shadow-[var(--md-sys-elevation-3)] transition-[scale,translate] duration-150 group-focus-within:scale-100 group-hover:scale-100">
          <div className="p-4">
            <p className="nav-menu-eyebrow">Features</p>
            <ul className="mt-2 grid gap-0.5">
              {primary.map((item, i) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-menu-item">
                    <SquircleIcon icon={item.icon} tone={TONES[i % TONES.length]} />
                    <span className="min-w-0">
                      <span className="nav-menu-title">{item.label}</span>
                      <span className="nav-menu-note">{PRIMARY_NOTES[item.href]}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="nav-menu-side p-4">
            <p className="nav-menu-eyebrow">Platform</p>
            <ul className="mt-2 grid">
              {platform.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="nav-menu-link">
                    <FeatureIcon icon={item.icon} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/features" className="nav-menu-all">
              All features <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
