import Link from "next/link";
import type { ReactNode } from "react";
import LogoMark from "../logo-mark";
import OnboardingProgress from "./onboarding-progress";

/** Onboarding layout: logo and step counter on top, the step in an 812px
 *  column, a privacy note at the bottom. Styled by the `.cal-onboard` block. */
export default function OnboardingShell({
  step,
  selfHosted,
  contentKey,
  children,
}: {
  step: number;
  selfHosted: boolean;
  /** Changes with the visible step so the entry animation replays. */
  contentKey: string;
  children: ReactNode;
}) {
  return (
    <main className="cal-site cal-onboard">
      <div className="cal-onboard-main">
        <div className="cal-onboard-col">
          <header className="cal-onboard-top">
            <Link href="/" className="cal-onboard-logo" aria-label="Omentir home">
              <LogoMark className="h-[38px] w-[38px]" />
              <span>Omentir</span>
            </Link>
            <OnboardingProgress current={step} selfHosted={selfHosted} />
          </header>
          <div key={contentKey} className="onboarding-step-enter cal-onboard-body">
            {children}
          </div>
          <p className="cal-onboard-note">
            Omentir uses your answers and your website to set up your workspace.{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
