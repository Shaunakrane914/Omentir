import Link from "next/link";
import type { ReactNode } from "react";
import type { FeatureNavIcon } from "./feature-nav";
import Reveal from "./scroll-reveal";
import SquircleIcon, { type SquircleTone } from "./squircle-icon";

/** One person row in a demo card: initials, name, detail and an optional pill. */
function MiniPerson({ face, name, detail, pill }: { face: string; name: string; detail: string; pill?: string }) {
  return (
    <div className="cal-mini-row">
      <span className="cal-mini-face">{face}</span>
      <span className="min-w-0 flex-1">
        <strong>{name}</strong>
        <small>{detail}</small>
      </span>
      {pill ? <span className="cal-mini-pill">{pill}</span> : null}
    </div>
  );
}

type Step = {
  title: string;
  body: string;
  items: Array<[FeatureNavIcon, SquircleTone, string]>;
  demo: ReactNode;
  art: ReactNode;
};

/** Pastel gradient fill for the resting-card artwork. Colors come from the
 *  theme's gradient tokens, so the shapes follow light and dark mode. */
function ArtGradient({ id, from, to }: { id: string; from: string; to: string }) {
  return (
    <defs>
      {/* Lit from the upper left: a soft highlight fading into two pale tints. */}
      <radialGradient id={id} cx="0.3" cy="0.15" r="1.05">
        <stop offset="0" style={{ stopColor: "var(--cal-art-light)", stopOpacity: 1 }} />
        <stop offset="0.55" style={{ stopColor: `var(${from})`, stopOpacity: 0.5 }} />
        <stop offset="1" style={{ stopColor: `var(${to})`, stopOpacity: 0.7 }} />
      </radialGradient>
    </defs>
  );
}

const ART_BOX = { viewBox: "0 0 240 260", preserveAspectRatio: "xMidYMax slice", "aria-hidden": true } as const;

const STEPS: Step[] = [
  {
    title: "Find",
    body: "Tell Omentir who you sell to. It finds matching people on LinkedIn and scores each one.",
    items: [
      ["search", "blue", "Search by role, industry and company size"],
      ["people", "lavender", "Every lead scored against your profile"],
      ["target", "lime", "Commenters on competitor posts included"],
    ],
    demo: (
      <div className="cal-mini">
        <p className="cal-mini-label">New leads</p>
        <div className="cal-mini-list">
          <MiniPerson face="PS" name="Priya Shah" detail="Head of Growth, fintech" pill="92 fit" />
          <MiniPerson face="ML" name="Marcus Lee" detail="VP Sales, SaaS" pill="88 fit" />
          <MiniPerson face="AC" name="Ana Costa" detail="Founder, devtools" pill="84 fit" />
        </div>
      </div>
    ),
    // A search lens.
    art: (
      <svg {...ART_BOX}>
        <ArtGradient id="cal-art-find" from="--cal-art-mint" to="--cal-art-blue" />
        <circle cx="104" cy="150" r="74" fill="none" stroke="url(#cal-art-find)" strokeWidth="40" />
        <rect x="150" y="206" width="44" height="110" rx="22" transform="rotate(-42 172 261)" fill="url(#cal-art-find)" />
      </svg>
    ),
  },
  {
    title: "Connect",
    body: "Connection requests go out from your own account, inside the daily limits you set.",
    items: [
      ["send", "lime", "Sent at a human pace"],
      ["shield", "mint", "Daily invite caps you control"],
      ["inbox", "orange", "Stale pending invites withdrawn for you"],
    ],
    demo: (
      <div className="cal-mini">
        <p className="cal-mini-label">Invites today</p>
        <div className="cal-mini-meter"><span style={{ width: "72%" }} /></div>
        <p className="cal-mini-note">18 of 25 sent</p>
        <div className="cal-mini-list cal-mini-divided">
          <MiniPerson face="PS" name="Priya Shah" detail="Accepted" />
          <MiniPerson face="ML" name="Marcus Lee" detail="Pending" />
        </div>
      </div>
    ),
    // Two linked circles.
    art: (
      <svg {...ART_BOX}>
        <ArtGradient id="cal-art-connect-a" from="--cal-art-blue" to="--cal-art-mint" />
        <ArtGradient id="cal-art-connect-b" from="--cal-art-lavender" to="--cal-art-blue" />
        <circle cx="86" cy="176" r="78" fill="url(#cal-art-connect-a)" />
        <circle cx="170" cy="140" r="78" fill="url(#cal-art-connect-b)" opacity="0.8" />
      </svg>
    ),
  },
  {
    title: "Message",
    body: "Once someone accepts, Omentir writes to them and follows up if they go quiet.",
    items: [
      ["message", "lavender", "Each message written for that lead"],
      ["send", "blue", "Follow-ups stop the moment they reply"],
      ["inbox", "mint", "Approve drafts or let them send"],
    ],
    demo: (
      <div className="cal-mini">
        <p className="cal-mini-label">Message 1</p>
        <p className="cal-mini-bubble">
          Saw your post on onboarding drop-off. We help teams like yours find buyers on LinkedIn.
        </p>
        <p className="cal-mini-note cal-mini-divided">Follow-up on Tuesday if there is no reply</p>
      </div>
    ),
    // Two chat bubbles.
    art: (
      <svg {...ART_BOX}>
        <ArtGradient id="cal-art-message-a" from="--cal-art-lavender" to="--cal-art-peach" />
        <ArtGradient id="cal-art-message-b" from="--cal-art-lime" to="--cal-art-lavender" />
        <path d="M24 118a44 44 0 0 1 44-44h86a44 44 0 0 1 0 88H70l-34 26 6-34a44 44 0 0 1-18-36Z" fill="url(#cal-art-message-a)" />
        <path d="M216 222a40 40 0 0 0-40-40H96a40 40 0 0 0 0 80h82l30 22-6-30a40 40 0 0 0 14-32Z" fill="url(#cal-art-message-b)" />
      </svg>
    ),
  },
  {
    title: "Book",
    body: "Interested replies land in your inbox, ready for you to pick up and book a call.",
    items: [
      ["inbox", "mint", "Replies sorted by intent"],
      ["message", "lavender", "Suggested reply drafts"],
      ["send", "orange", "An email when a lead replies"],
    ],
    demo: (
      <div className="cal-mini">
        <p className="cal-mini-label">Reply</p>
        <p className="cal-mini-bubble is-in">Sounds useful. Free Thursday afternoon?</p>
        <div className="cal-mini-slots">
          <span>2:00 pm</span>
          <span>3:30 pm</span>
          <span>4:00 pm</span>
        </div>
        <div className="cal-mini-list cal-mini-divided">
          <MiniPerson face="PS" name="Priya Shah" detail="Thursday, 3:30 pm" pill="Booked" />
        </div>
      </div>
    ),
    // A calendar grid with one day picked.
    art: (
      <svg {...ART_BOX}>
        <ArtGradient id="cal-art-book" from="--cal-art-lime" to="--cal-art-lavender" />
        <ArtGradient id="cal-art-book-on" from="--cal-art-mint" to="--cal-art-blue" />
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={22 + col * 70}
              y={92 + row * 70}
              width="58"
              height="58"
              rx="18"
              fill={row === 1 && col === 1 ? "url(#cal-art-book-on)" : "url(#cal-art-book)"}
              opacity={row === 1 && col === 1 ? 1 : 0.55}
            />
          )),
        )}
      </svg>
    ),
  },
];

/** "Built for..." band: four step cards; the hovered or focused card widens
 *  and shows its small demo, the first card is open by default. */
export default function HomeSteps() {
  return (
    <section aria-labelledby="cal-steps-heading" className="cal-section omentir-primary-width">
      <Reveal className="cal-intro">
        <h2 id="cal-steps-heading" className="cal-h2-xl">
          Four steps. You only do the last one.
        </h2>
        <p className="cal-lead">
          Omentir finds people who fit your buyer profile, connects with them from your LinkedIn
          account, and follows up when they go quiet. When someone wants to talk, you get an email
          and book the call.
        </p>
        <Link href="/signup" className="site-btn site-btn-primary mt-8">
          Get started
        </Link>
      </Reveal>

      <Reveal>
        <ol className="cal-steps">
          {STEPS.map((step) => (
            <li key={step.title} className="cal-step" tabIndex={0}>
              <div className="cal-step-head">
                <h3>{step.title}</h3>
                <p className="cal-muted">{step.body}</p>
                <ul className="cal-step-items">
                  {step.items.map(([icon, tone, text]) => (
                    <li key={text}>
                      <SquircleIcon icon={icon} tone={tone} size={22} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cal-step-art" aria-hidden="true">
                {step.art}
              </div>
              <div className="cal-step-demo" aria-hidden="true">
                {step.demo}
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
