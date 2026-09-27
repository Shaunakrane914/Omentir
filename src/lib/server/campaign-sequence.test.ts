import { describe, expect, test } from "bun:test";
import {
  buildCampaignSteps,
  campaignStepsFromActions,
  sequenceHasManualCopy,
} from "./campaign-sequence";

describe("campaignStepsFromActions", () => {
  test("inserts wait steps between actions because the planner only sends after a delay, not immediately after connect", () => {
    const steps = campaignStepsFromActions([
      { kind: "connect", mode: "ai" },
      { kind: "message", mode: "manual", manualMessage: "Hi {{firstName}}", waitValue: 15, waitUnit: "minutes" },
    ]);
    expect(steps?.map((step) => step.type)).toEqual(["connect", "wait", "message"]);
    expect(steps?.[1]).toMatchObject({ type: "wait", delayMinutes: 15 });
    expect(steps?.[2]).toMatchObject({ type: "message", messageTemplate: "Hi {{firstName}}" });
  });

  test("treats an AI message as empty copy so Steal Customers can keep post and comment context", () => {
    const steps = campaignStepsFromActions([
      { kind: "connect", mode: "ai" },
      { kind: "message", mode: "ai", waitValue: 1, waitUnit: "hours" },
    ]);
    expect(sequenceHasManualCopy(steps || [])).toBe(false);
  });

  test("flags a typed connection note as manual copy so Steal Customers can reject it", () => {
    const steps = campaignStepsFromActions([
      { kind: "connect", mode: "manual", includeNote: true, manualMessage: "Saw your comment" },
    ]);
    expect(sequenceHasManualCopy(steps || [])).toBe(true);
  });
});

describe("buildCampaignSteps manual outreach", () => {
  function manualForm(messages: Record<string, string>) {
    const formData = new FormData();
    formData.set("manualDefaultOutreach", "on");
    for (const [name, value] of Object.entries(messages)) formData.set(name, value);
    return formData;
  }

  test("drops unwritten trailing messages because an empty template is AI-drafted, and manual users must never get AI text they did not write", () => {
    const steps = buildCampaignSteps(manualForm({ firstMessage: "Hi {{firstName}}" }), 60);
    const messages = steps.filter((step) => step.type === "message");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ messageTemplate: "Hi {{firstName}}" });
    expect(steps.at(-1)?.type).toBe("message");
  });

  test("keeps the full seven-step layout when all three messages are written so edits line up with in-flight enrollments", () => {
    const steps = buildCampaignSteps(
      manualForm({ firstMessage: "One", secondMessage: "Two", thirdMessage: "Three" }),
      60,
    );
    expect(steps.map((step) => step.type)).toEqual([
      "connect", "wait", "message", "wait", "message", "wait", "message",
    ]);
  });
});
