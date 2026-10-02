import { describe, expect, test } from "bun:test";
import { agentPasteTarget } from "./agent-paste-target";

describe("agentPasteTarget", () => {
  test("labels Cue pages for Cue so the copy button names the app the prompt is written for", () => {
    expect(agentPasteTarget("manus-cue-speed-to-lead")).toBe("Cue");
    expect(agentPasteTarget("manus-cue")).toBe("Cue");
  });

  test("labels main Manus app guides for Manus, not Cue, because Automations and Studio only exist in Manus", () => {
    expect(agentPasteTarget("manus-automations-for-linkedin-outreach")).toBe("Manus");
  });

  test("keeps the Grok Bot default for unrelated pages", () => {
    expect(agentPasteTarget("grok-bot-sales-outreach")).toBeUndefined();
  });
});
