"use client";

// Progress indicator shown at the top of the consolidated onboarding flow:
// "STEP 2 OF 4" beside a segmented bar. The current step is computed
// server-side from workspace state, so steps cannot be skipped. Client
// component only so advancing a step can animate: the next segment fills in
// from the previous state instead of snapping.
import { useEffect, useState } from "react";

const PRODUCT_STEPS = [
  "Your Product",
  "Example Leads",
  "Personalisation",
  "Select Plan",
] as const;

const SELF_HOSTED_STEPS = ["Your Product", "Example Leads"] as const;

export default function OnboardingProgress({
  current,
  selfHosted = false,
}: {
  current: number;
  selfHosted?: boolean;
}) {
  // Visuals render from `displayStep`, which lags `current` by a frame when
  // the user advances so the fill transitions from the previous state.
  // Advancing a step is a soft navigation (server action redirect back to
  // /onboarding), so this instance survives with its old state; hard loads
  // render `current` statically.
  const visibleCurrent = selfHosted ? (current >= 2 ? 2 : 1) : current;
  const [displayStep, setDisplayStep] = useState(visibleCurrent);
  const steps: readonly string[] = selfHosted ? SELF_HOSTED_STEPS : PRODUCT_STEPS;

  useEffect(() => {
    if (displayStep === visibleCurrent) return;
    // Double rAF: let the browser paint the previous state first so the
    // change is transitioned rather than applied instantly.
    let nextRaf = 0;
    const firstRaf = requestAnimationFrame(() => {
      nextRaf = requestAnimationFrame(() => setDisplayStep(visibleCurrent));
    });
    return () => {
      cancelAnimationFrame(firstRaf);
      cancelAnimationFrame(nextRaf);
    };
  }, [visibleCurrent, displayStep]);

  return (
    <div
      className="cal-onboard-progress"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={visibleCurrent}
      aria-valuetext={`Step ${visibleCurrent} of ${steps.length}: ${steps[visibleCurrent - 1]}`}
    >
      <span className="cal-onboard-progress-label">
        Step {visibleCurrent} of {steps.length}
      </span>
      <span className="cal-onboard-progress-bar" aria-hidden="true">
        {steps.map((label, index) => (
          <span key={label} className={index < displayStep ? "is-filled" : undefined} />
        ))}
      </span>
    </div>
  );
}
