export type AlternativePick = {
  openIf: string;
};

const PICK: Record<string, AlternativePick> = {
  "linkedin-automation": {
    openIf:
      "You are choosing LinkedIn sequencers, chrome tools, or a workspace that still has to find the list.",
  },
  "ai-sdr": {
    openIf:
      "You searched AI SDR and need to tell a packaged agent from a LinkedIn workspace you can open and pause.",
  },
  "sales-navigator": {
    openIf:
      "You already live in Sales Navigator search, and those exports never become a conversation.",
  },
  "b2b-databases": {
    openIf:
      "Apollo, Cognism, or Lusha is the current source, and the CSV is sitting unused.",
  },
  "email-outreach": {
    openIf:
      "Instantly or Smartlead covers email, and LinkedIn is the missing channel.",
  },
  "grok-bot": {
    openIf:
      "You have Grok Bot, or you are shopping overnight research without letting a cloud browser drive LinkedIn.",
  },
  "meta-muse": {
    openIf:
      "Muse isn't in your country yet, or you'd rather not have the agent from your personal apps doing sales.",
  },
  "openai-dots": {
    openIf:
      "You aren't on ChatGPT Pro or Business Premium, or Dots haven't reached your region.",
  },
  "manus-cue": {
    openIf:
      "You don't have a Cue invite, or your Cue account can't add a custom MCP server yet.",
  },
};

export function alternativePick(slug: string): AlternativePick {
  const row = PICK[slug];
  if (!row) {
    throw new Error(`Missing alternatives pick row for ${slug}`);
  }
  return row;
}
