import { describe, expect, test } from "bun:test";
import { renderTemplate } from "./outreach-rules";

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
