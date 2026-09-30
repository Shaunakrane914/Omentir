/** Which agent a page's paste-ready prompt is for, from the page slug.
 *  Undefined keeps the Grok Bot default used by the older pages. */
export function agentPasteTarget(slug: string): string | undefined {
  if (slug.includes("meta-muse")) return "Meta Muse";
  if (slug.includes("openai-dot") || slug.includes("sales-dot")) return "your Dot";
  if (slug.includes("manus-cue") || slug.includes("cue-agent")) return "Cue";
  return undefined;
}
