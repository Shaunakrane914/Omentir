"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import SquircleIcon, { type SquircleTone } from "./squircle-icon";
import {
  MockInboxScreen,
  MockLeadsScreen,
  MockStealScreen,
} from "./home-product-mock";
import { useScrollScrub, useScrubEnabled } from "./use-scroll-scrub";

type Tab = {
  id: string;
  label: string;
  icon: "search" | "target" | "message" | "inbox";
  tone: SquircleTone;
  title: string;
  body: string;
  href: string;
  draw: ReactNode;
};

const TABS: Tab[] = [
  {
    id: "find",
    label: "Lead finders",
    icon: "search",
    tone: "blue",
    title: "Find people who match your buyer profile",
    body: "Describe your ideal customer or drop in your website. Omentir searches LinkedIn, scores every lead against your profile, and keeps the ones that fit.",
    href: "/features/lead-finders",
    draw: <MockLeadsScreen funnel compact interactive />,
  },
  {
    id: "steal",
    label: "Steal Customers",
    icon: "target",
    tone: "lime",
    title: "Reach the people talking to your competitors",
    body: "Add a competitor's company page. Omentir scans their posts and their team's posts, then pulls out the commenters who look like buyers.",
    href: "/features/steal-customers",
    draw: <MockStealScreen compact />,
  },
  {
    id: "message",
    label: "AI outreach",
    icon: "message",
    tone: "lavender",
    title: "Outreach that reads like you wrote it",
    body: "Connection requests and messages go out from your own profile at a human pace. Each message is written from what Omentir knows about that lead.",
    href: "/features/ai-linkedin-outreach",
    draw: <MockInboxScreen compact focus />,
  },
  {
    id: "inbox",
    label: "Unified inbox",
    icon: "inbox",
    tone: "mint",
    title: "Every reply in one inbox, sorted by intent",
    body: "Replies from every campaign land in one place. Interested leads rise to the top, and you can answer them or book the call from there.",
    href: "/features/unified-inbox",
    draw: <MockInboxScreen booked compact interactive />,
  },
];

const GROW = 280; // px of scroll spent growing (and later shrinking) the stage
const SEG = 0.7; // viewport heights of scroll per tab while pinned
const GAP = 24; // stage inset from the viewport edges when full size

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (v: number) => v * v * (3 - 2 * v);

/** Hero product box: icon tabs over a gradient stage, one card per product
 *  area with copy on the left and the live product mock on the right.
 *
 *  On large screens it is scroll-driven: the stage scrolls up, grows to fill
 *  the viewport, stays pinned while the tabs crossfade one per SEG of scroll,
 *  then shrinks back and scrolls away. Elsewhere the tabs are plain buttons. */
export default function HomeProductTabs() {
  const scrub = useScrubEnabled();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLElement | null)[]>([]);

  useScrollScrub(trackRef, scrub, (scrolled) => {
    const stage = stageRef.current;
    const inner = innerRef.current;
    if (!stage || !inner) return;
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const seg = vh * SEG;
    const pinned = TABS.length * seg;

    const grow = ease(clamp(scrolled / GROW) * (1 - clamp((scrolled - GROW - pinned) / GROW)));
    const baseW = Math.min(stage.parentElement?.clientWidth ?? vw, 1216); // 76rem, the resting width
    const baseH = inner.offsetHeight;
    stage.style.width = `${baseW + (vw - 2 * GAP - baseW) * grow}px`;
    stage.style.height = `${baseH + Math.max(0, vh - 2 * GAP - baseH) * grow}px`;
    document.documentElement.toggleAttribute("data-cal-immersive", grow > 0.6);

    // t runs 0..n-1 across the pinned stretch; each panel is fully visible
    // for most of its segment and crossfades over the middle 30% of a boundary.
    const t = clamp((scrolled - GROW) / seg - 0.5, 0, TABS.length - 1);
    layerRefs.current.forEach((el, i) => {
      if (el) el.style.opacity = String(clamp((0.5 - Math.abs(t - (i % TABS.length))) / 0.15 + 0.5));
    });
    const index = Math.round(t);
    if (index !== activeRef.current) {
      activeRef.current = index;
      setActive(index);
    }
  });

  // Leaving scrub mode (resize, reduced motion) hands control back to CSS.
  useEffect(() => {
    if (scrub) return;
    document.documentElement.removeAttribute("data-cal-immersive");
    stageRef.current?.style.removeProperty("width");
    stageRef.current?.style.removeProperty("height");
    layerRefs.current.forEach((el) => el?.style.removeProperty("opacity"));
  }, [scrub]);

  useEffect(() => () => document.documentElement.removeAttribute("data-cal-immersive"), []);

  const pick = (i: number) => {
    const track = trackRef.current;
    if (!scrub || !track) {
      activeRef.current = i;
      setActive(i);
      return;
    }
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + GROW + (i + 0.5) * window.innerHeight * SEG, behavior: "smooth" });
  };

  const layer = (i: number) => (el: HTMLElement | null) => {
    layerRefs.current[i] = el;
  };

  return (
    <div ref={trackRef} className={`cal-stage-track${scrub ? " is-scrub" : ""}`} id="features">
      <div className="cal-stage-pin">
        <div ref={stageRef} className="cal-stage">
          {TABS.map((t, i) => (
            <div
              key={t.id}
              ref={layer(i + TABS.length)}
              className={`cal-stage-back is-${t.id}${i === active ? " is-on" : ""}`}
              aria-hidden="true"
            />
          ))}
          <div ref={innerRef} className="cal-stage-inner">
            <div className="cal-tabs" role="tablist" aria-label="Omentir products">
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`cal-tab-${t.id}`}
                  aria-selected={i === active}
                  aria-controls={`cal-panel-${t.id}`}
                  aria-label={t.label}
                  title={t.label}
                  className="cal-tab"
                  onClick={() => pick(i)}
                >
                  <SquircleIcon icon={t.icon} tone={i === active ? t.tone : "muted"} size={52} ring />
                </button>
              ))}
            </div>

            <div className="cal-tab-cards">
              {TABS.map((t, i) => (
                <div
                  key={t.id}
                  ref={layer(i)}
                  id={`cal-panel-${t.id}`}
                  role="tabpanel"
                  aria-labelledby={`cal-tab-${t.id}`}
                  inert={i !== active}
                  className={`cal-tab-card${i === active ? " is-on" : ""}`}
                >
                  <div className="cal-tab-copy">
                    <h2>{t.title}</h2>
                    <p className="cal-muted">{t.body}</p>
                    <Link href={t.href} className="cal-underline-link">
                      Learn more <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                  <div className="cal-tab-draw">{t.draw}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
