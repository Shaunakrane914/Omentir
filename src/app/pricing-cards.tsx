"use client";

import Link from "next/link";
import { pricingPlans as plans, type PricingPlan } from "@/app/pricing-plans";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="h-[1lh] w-3.5 shrink-0 text-[var(--md-sys-color-on-surface)]"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanPrice({ price, cadence, site }: { price: string; cadence: string; site?: boolean }) {
  const amountClass = site
    ? "text-[1.75rem] font-normal tracking-tight text-[var(--md-sys-color-on-surface)] md:text-[2rem]"
    : "text-4xl font-semibold tracking-tight text-[var(--md-sys-color-on-surface)] md:text-5xl";
  const monthly = price.match(/^(\$\d+)(\/month)$/);
  if (monthly) {
    return (
      <div className="mt-3 flex items-baseline gap-0.5">
        <span className={amountClass}>
          {monthly[1]}
        </span>
        <span className="text-base font-medium text-[var(--md-sys-color-on-surface-variant)] md:text-lg">
          {monthly[2]}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-baseline gap-1">
      <span className={amountClass}>
        {price}
      </span>
      {cadence ? (
        <span className="text-base font-medium text-[var(--md-sys-color-on-surface-variant)]">
          {cadence}
        </span>
      ) : null}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type CurrentPlan = "solo" | "lifetime" | "enterprise";
type PlanKey = "solo" | "enterprise";

function planKeyFromHref(href: string): PlanKey {
  return href.includes("plan=solo") ? "solo" : "enterprise";
}

/** Marketing card: a white top (name, note, price, arrow button) on a cream
 *  card that holds the feature list. The featured plan sits in a gradient
 *  frame with a label. Styled by `.cal-price-*`. */
function SitePricingCard({
  plan,
  cta,
  current,
}: {
  plan: PricingPlan;
  cta: string;
  current: boolean;
}) {
  const monthly = plan.price.match(/^(\$\d+)\/(month)$/);
  const buttonClass = `cal-price-cta${plan.featured ? " is-primary" : ""}`;

  const card = (
    <article className="cal-price">
      <div className="cal-price-top">
        <h2 className="cal-price-name">{plan.name}</h2>
        <p className="cal-price-note">
          {planKeyFromHref(plan.href) === "solo"
            ? "Get 3 bookings weekly or receive a full refund."
            : "Get managed campaigns with bookings guarantees."}
        </p>
        <p className="cal-price-amount">
          {monthly ? (
            <>
              {monthly[1]}
              <small>/{monthly[2]}</small>
            </>
          ) : (
            plan.price
          )}
        </p>
        {current ? (
          <span className="cal-price-cta is-current">Your current plan</span>
        ) : plan.href.startsWith("http") ? (
          <a href={plan.href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            {cta}
            <ArrowIcon />
          </a>
        ) : (
          <Link href={plan.href} className={buttonClass}>
            {cta}
            <ArrowIcon />
          </Link>
        )}
      </div>
      <div className="cal-price-body">
        {plan.includes ? <p className="cal-price-includes">{plan.includes}</p> : null}
        <ul className="cal-price-features">
          {plan.features.map((feature) => (
            <li key={feature}>
              <CheckIcon />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );

  if (!plan.featured) return card;
  return (
    <div className="cal-price-frame">
      <p className="cal-price-flag">Best for solo founders</p>
      {card}
    </div>
  );
}

function PricingCard({
  plan,
  currentPlan,
  subscribeCta,
  site,
}: {
  plan: PricingPlan;
  currentPlan?: CurrentPlan;
  subscribeCta?: string;
  site?: boolean;
}) {
  const planKey = planKeyFromHref(plan.href);
  const cta = planKey === "solo" && subscribeCta ? subscribeCta : plan.cta;
  const isCurrent = currentPlan === planKey;
  // Legacy lifetime members remain covered by the Pro feature set, so the
  // card must never offer them a redundant monthly subscription.
  const isCoveredByLegacyPlan = currentPlan === "lifetime" && planKey === "solo";
  // Marketing /pricing uses Cursor's 44px pills; the in-app upgrade screens
  // keep the full-width Material buttons.
  if (site) {
    return <SitePricingCard plan={plan} cta={cta} current={isCurrent || isCoveredByLegacyPlan} />;
  }

  const ctaClass = site
    ? `site-btn ${plan.featured ? "site-btn-primary" : "site-btn-secondary"}`
    : `m3-btn h-11 w-full cursor-pointer text-sm ${
        plan.featured ? "m3-btn-filled" : "m3-btn-outlined"
      }`;

  return (
    <article
      className={
        site
          ? "site-price-card w-full text-left"
          : "flex h-full w-full flex-col rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-5 text-left text-[var(--md-sys-color-on-surface)] md:p-7"
      }
    >
      <h2
        className={
          site
            ? "text-lg font-normal text-[var(--md-sys-color-on-surface)]"
            : "text-lg font-semibold tracking-tight text-[var(--md-sys-color-on-surface)] md:text-xl"
        }
      >
        {plan.name}
      </h2>

      <PlanPrice price={plan.price} cadence={plan.cadence} site={site} />

      {planKey === "solo" ? (
        <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--md-sys-color-on-surface-variant)]">
          Get 3 bookings weekly or receive a full refund.
        </p>
      ) : (
        <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--md-sys-color-on-surface-variant)]">
          Get managed campaigns with bookings guarantees.
        </p>
      )}

      {plan.includes ? (
        <p
          className={`mb-4 mt-8 text-sm ${
            site
              ? "text-[var(--md-sys-color-on-surface-variant)]"
              : "font-medium text-[var(--md-sys-color-on-surface)]"
          }`}
        >
          {plan.includes}
        </p>
      ) : (
        <div className="mt-8" />
      )}

      <ul className="space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={`flex items-start gap-3 text-sm leading-6 ${
              site ? "text-[var(--md-sys-color-on-surface)]" : "text-[var(--md-sys-color-on-surface-variant)]"
            }`}
          >
            <CheckIcon />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        {isCurrent || isCoveredByLegacyPlan ? (
          <span
            className={
              site
                ? "site-btn site-btn-outline cursor-default"
                : "m3-btn m3-btn-outlined h-11 w-full cursor-default border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-high)] text-sm text-[var(--md-sys-color-on-surface-variant)]"
            }
          >
            Your current plan
          </span>
        ) : plan.href.startsWith("http") ? (
          <a href={plan.href} target="_blank" rel="noopener noreferrer" className={ctaClass}>
            {cta}
          </a>
        ) : (
          <Link href={plan.href} className={ctaClass}>
            {cta}
          </Link>
        )}
      </div>
    </article>
  );
}

export default function PricingCards({
  className = "",
  currentPlan,
  subscribeCta,
  site,
}: {
  className?: string;
  currentPlan?: CurrentPlan;
  subscribeCta?: string;
  site?: boolean;
}) {
  return (
    <div className={className}>
      <div
        className={
          site
            ? "cal-price-grid"
            : "grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5"
        }
      >
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} currentPlan={currentPlan} subscribeCta={subscribeCta} site={site} />
        ))}
      </div>
    </div>
  );
}
