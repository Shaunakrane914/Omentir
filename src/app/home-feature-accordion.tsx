"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import type { FeatureNavIcon } from "./feature-nav";
import IntegrationLogo from "./integrations/integration-logo";
import SquircleIcon, { type SquircleTone } from "./squircle-icon";
import { useScrollScrub, useScrubEnabled } from "./use-scroll-scrub";

type Feature = {
  title: string;
  body: string;
  href: string;
  icon: FeatureNavIcon;
  demo: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Lead groups and scoring",
    body: "Keep leads in groups, see why each one fits, and point any campaign at any group.",
    href: "/features/lead-groups-and-scoring",
    icon: "people",
    demo: (
      <>
        <p className="cal-float-kicker">Lead group</p>
        <p className="cal-float-title">High-intent SaaS leaders</p>
        <ul className="cal-float-list">
          <li><span>Maya Chen</span><em>94</em></li>
          <li><span>Daniel Ortiz</span><em>88</em></li>
          <li><span>Aisha Karim</span><em>81</em></li>
        </ul>
      </>
    ),
  },
  {
    title: "Campaigns and send windows",
    body: "Pick the hours messages go out. Omentir sends in each lead's time zone and stays inside your daily limits.",
    href: "/features/campaigns-and-send-windows",
    icon: "send",
    demo: (
      <>
        <p className="cal-float-kicker">Send window</p>
        <p className="cal-float-title">Mon to Fri, 9:00 to 17:00</p>
        <p className="cal-float-toggle">
          Lead&apos;s time zone <span className="cal-switch" aria-hidden="true" />
        </p>
      </>
    ),
  },
  {
    title: "LinkedIn account safety",
    body: "Daily invite and message caps, human pacing, and a health meter for your account. You still own compliance with LinkedIn's rules.",
    href: "/features/linkedin-account-safety",
    icon: "shield",
    demo: (
      <>
        <p className="cal-float-kicker">Today</p>
        <p className="cal-float-meter">Invites <span><i style={{ width: "72%" }} /></span> 18/25</p>
        <p className="cal-float-meter">Messages <span><i style={{ width: "55%" }} /></span> 33/60</p>
        <p className="cal-float-ok">Account health: good</p>
      </>
    ),
  },
  {
    title: "Reply drafts",
    body: "When a lead replies, Omentir drafts an answer from the whole conversation. Edit it, send it, or write your own.",
    href: "/features/reply-drafts",
    icon: "inbox",
    demo: (
      <>
        <p className="cal-mini-bubble is-in">How does pricing work for a team of three?</p>
        <p className="cal-float-kicker mt-3">Draft</p>
        <p className="cal-mini-bubble">Happy to explain. Want to grab 15 minutes this week?</p>
      </>
    ),
  },
  {
    title: "Agent API and MCP",
    body: "Run Omentir from Claude, ChatGPT, Cursor or your own code. Create agents, read replies and check stats without opening the app.",
    href: "/features/agent-api-and-mcp",
    icon: "network",
    demo: (
      <>
        <div className="flex gap-2">
          <IntegrationLogo slug="claude" size="sm" />
          <IntegrationLogo slug="chatgpt" size="sm" />
          <IntegrationLogo slug="cursor" size="sm" />
        </div>
        <p className="cal-float-code">omentir_list_inbox</p>
        <p className="cal-float-title">3 new replies</p>
      </>
    ),
  },
  {
    title: "Open source self-hosting",
    body: "The code is MIT licensed on GitHub. Use the hosted version or run it on your own server.",
    href: "/features/open-source-self-hosting",
    icon: "code",
    demo: (
      <>
        <p className="cal-float-kicker">License</p>
        <p className="cal-float-title">MIT</p>
        <ul className="cal-float-list">
          <li><span>Hosted at omentir.com</span></li>
          <li><span>Self-hosted on your server</span></li>
        </ul>
      </>
    ),
  },
];

const TONES: SquircleTone[] = ["blue", "lime", "lavender", "orange", "mint", "blue"];

const SEG = 0.45; // viewport heights of scroll per item while pinned
const WINDOW = 3; // items shown while pinned: the open one and its neighbors

/** Accordion feature list with a demo panel, one open item at a time. On
 *  large screens the section pins and scrolling walks through the items;
 *  elsewhere the items open on click. */
export default function HomeFeatureAccordion() {
  const scrub = useScrubEnabled();
  const [open, setOpen] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const feature = FEATURES[open];
  // While pinned, only a window of items is shown so the open one has room
  // to read; the window slides with scroll. Unpinned, every item stays.
  const start = Math.min(Math.max(open - 1, 0), FEATURES.length - WINDOW);
  const isFar = (i: number) => scrub && (i < start || i >= start + WINDOW);

  useScrollScrub(trackRef, scrub, (scrolled) => {
    const index = Math.min(FEATURES.length - 1, Math.max(0, Math.floor(scrolled / (window.innerHeight * SEG))));
    setOpen((current) => (current === index ? current : index));
  });

  const pick = (i: number) => {
    const track = trackRef.current;
    if (!scrub || !track) {
      setOpen(i);
      return;
    }
    const top = track.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i + 0.5) * window.innerHeight * SEG, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="cal-feature-heading" className="cal-section omentir-primary-width">
      <div ref={trackRef} className={`cal-feature-track${scrub ? " is-scrub" : ""}`}>
        <div className="cal-split">
          <div>
            <h2 id="cal-feature-heading" className="cal-h2-lg">
              One place for your whole LinkedIn pipeline
            </h2>
            <ul className="cal-accordion">
              {FEATURES.map((f, i) => (
                <li
                  key={f.title}
                  className={[i === open && "is-open", isFar(i) && "is-far"].filter(Boolean).join(" ") || undefined}
                  inert={isFar(i) || undefined}
                >
                  <div className="cal-accordion-item">
                    <button
                      type="button"
                      aria-expanded={i === open}
                      onClick={() => pick(i)}
                      className="cal-accordion-head"
                    >
                      <SquircleIcon icon={f.icon} tone={i === open ? TONES[i] : "muted"} size={28} />
                      <span>{f.title}</span>
                    </button>
                    {i === open ? (
                      <div className="cal-accordion-body">
                        <p className="cal-muted">{f.body}</p>
                        <Link href={f.href} className="cal-underline-link">
                          Learn more <span aria-hidden="true">&rarr;</span>
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="cal-float-stage" aria-hidden="true">
            <div key={feature.title} className="cal-float-card">
              {feature.demo}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
