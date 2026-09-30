"use client";

import { unwrapAction } from "@/lib/action-result";
import { useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { completeOnboardingQuestionsAction } from "../actions";
import {
  ONBOARDING_SURVEY_SENT_EVENT,
  ONBOARDING_SURVEY_SHOWN_EVENT,
  onboardingSurveySentProperties,
  onboardingSurveyShownProperties,
} from "@/lib/posthog-onboarding";

// [value, emoji]. The values are what the server action and analytics
// receive, so they must not change.
const sources: Array<[string, string]> = [
  ["LinkedIn", "💼"],
  ["Google", "🔎"],
  ["A founder friend", "🤝"],
  ["Twitter / X", "🐦"],
  ["YouTube", "▶️"],
  ["Reddit", "💬"],
  ["Newsletter / blog", "📰"],
  ["Product Hunt", "🚀"],
  ["Other", "✳️"],
];
const roles: Array<[string, string]> = [
  ["Founder", "🚀"],
  ["Sales", "💼"],
  ["Marketing", "📣"],
  ["Operator", "⚙️"],
  ["Growth", "📈"],
  ["Agency owner", "🏢"],
  ["Recruiter", "🧲"],
  ["Freelancer / consultant", "🧑‍💻"],
  ["Other", "✳️"],
];
const sizes: Array<[string, string]> = [
  ["Just me", "🙋"],
  ["2-10", "👥"],
  ["11-50", "🏠"],
  ["51-200", "🏢"],
  ["201-500", "🏙️"],
  ["500+", "🌐"],
];

/** One question: heading, hint, and a native dropdown (compact, keyboard
 *  friendly, and required-validation comes for free). */
function ChoiceGroup({
  title,
  hint,
  name,
  options,
  heading = false,
}: {
  title: string;
  hint: string;
  name: string;
  options: Array<[string, string]>;
  /** The step's first question doubles as its page heading. */
  heading?: boolean;
}) {
  const id = `onboarding-${name}`;
  const label = (
    <label htmlFor={id} className="cal-onboard-q-title">
      {title}
    </label>
  );
  return (
    <div className="cal-onboard-question">
      {heading ? <h1 className="m-0">{label}</h1> : label}
      <p className="cal-onboard-q-hint">{hint}</p>
      <select id={id} name={name} required defaultValue="" className="auth-input">
        <option value="" disabled>
          Choose one
        </option>
        {options.map(([value, emoji]) => (
          <option key={value} value={value}>
            {emoji} {value}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function StepQuestions() {
  const posthog = usePostHog();
  const [pending, setPending] = useState(false);
  const [submissionId] = useState(() => crypto.randomUUID());
  const shown = useRef(false);

  useEffect(() => {
    if (!posthog || shown.current) return;
    shown.current = true;
    posthog.capture(ONBOARDING_SURVEY_SHOWN_EVENT, onboardingSurveyShownProperties());
  }, [posthog]);

  async function submit(formData: FormData) {
    if (pending) return;
    setPending(true);
    const answers = {
      source: String(formData.get("source") || "").trim(),
      role: String(formData.get("role") || "").trim(),
      companySize: String(formData.get("companySize") || "").trim(),
      goal: String(formData.get("goal") || "").trim(),
    };
    if (posthog && answers.source && answers.role && answers.companySize && answers.goal) {
      // Beacon + send_instantly so the event leaves before the server action redirects.
      posthog.capture(
        ONBOARDING_SURVEY_SENT_EVENT,
        {
          ...onboardingSurveySentProperties(answers, submissionId),
          $insert_id: `onboarding_survey:${submissionId}`,
        },
        { send_instantly: true, transport: "sendBeacon" },
      );
    }
    try {
      unwrapAction(await completeOnboardingQuestionsAction(formData));
    } catch (error) {
      setPending(false);
      throw error;
    }
  }

  return (
    <div className="w-full">
      <form action={submit} className="cal-onboard-form">
        <input type="hidden" name="surveySubmissionId" value={submissionId} />
        <ChoiceGroup
          title="What is your job?"
          hint="Your answers help Omentir shape the buyer profile and outreach around your team."
          name="role"
          options={roles}
          heading
        />
        <ChoiceGroup title="How big is your company?" hint="Count everyone, not just sales." name="companySize" options={sizes} />
        <ChoiceGroup title="Where did you hear about us?" hint="Pick one." name="source" options={sources} />

        <div className="cal-onboard-question">
          <label htmlFor="onboarding-goal" className="cal-onboard-q-title">
            What do you want Omentir to help with?
          </label>
          <p className="cal-onboard-q-hint">A sentence is enough.</p>
          <div className="cal-onboard-panel">
            <textarea
              id="onboarding-goal"
              name="goal"
              required
              rows={4}
              className="auth-textarea"
              placeholder="Example: find SaaS founders and start LinkedIn outreach"
            />
          </div>
        </div>

        <div className="cal-onboard-actions">
          <button type="submit" className="cal-onboard-next" disabled={pending}>
            {pending ? "Saving..." : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
