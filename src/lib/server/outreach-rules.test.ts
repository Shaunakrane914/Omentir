import { describe, expect, test } from "bun:test";
import { renderTemplate, writtenSequenceMessage } from "./outreach-rules";

describe("renderTemplate", () => {
  test("fills {{lastName}} because the sequence editor offers it, and an unfilled token would reach the lead as literal braces", () => {
    const rendered = renderTemplate("Hi {{firstName}} {{lastName}}", {
      name: "Ada Lovelace",
      company: "Analytical",
      title: "Engineer",
    });
    expect(rendered).toEqual({ text: "Hi Ada Lovelace", natural: true });
  });

  test("marks a message with {{leadReason}} as not sendable, so it is AI-drafted instead of sent with a hole in it", () => {
    const rendered = renderTemplate("Saw {{leadReason}}", { name: "Ada", company: "A", title: "B" });
    expect(rendered.natural).toBe(false);
  });
});

describe("writtenSequenceMessage", () => {
  const lead = { name: "Ada Lovelace", company: "Analytical", title: "Engineer" };
  const step = { id: "first-message", messageTemplate: "Hi {{firstName}} from the template" };

  test("sends the user's own message for this lead over the agent template, because a rewrite that still goes out as the template is the bug customers hit", () => {
    expect(writtenSequenceMessage(step, lead, { "first-message": "My own words, Ada" })).toEqual({
      text: "My own words, Ada",
      edited: true,
    });
  });

  test("sends the user's own message even when the step is AI-written, so AI never replaces text the user wrote", () => {
    const aiStep = { id: "second-message", messageTemplate: "" };
    expect(writtenSequenceMessage(aiStep, lead, { "second-message": "Written by me" })?.text).toBe("Written by me");
  });

  test("ignores edits for other steps and blank edits, falling back to the template", () => {
    expect(writtenSequenceMessage(step, lead, { "second-message": "Not this one", "first-message": "   " })).toEqual({
      text: "Hi Ada from the template",
      edited: false,
    });
  });

  test("returns nothing when there is no edit and the template cannot render cleanly, which is the only case AI drafts", () => {
    expect(writtenSequenceMessage({ id: "first-message", messageTemplate: "" }, lead, undefined)).toBeUndefined();
    expect(writtenSequenceMessage({ id: "first-message", messageTemplate: "Saw {{leadReason}}" }, lead, {})).toBeUndefined();
  });
});
