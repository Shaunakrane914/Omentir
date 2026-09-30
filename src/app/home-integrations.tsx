import Link from "next/link";
import { IntegrationMark } from "./integrations/integration-logo";
import Reveal from "./scroll-reveal";

const LOGOS = [
  "claude",
  "chatgpt",
  "cursor",
  "claude-code",
  "codex",
  "grok",
  "grok-bot",
  "openclaw",
  "mcp",
  "rest-api",
];

/** Integrations band: logo tiles and two summary cards. */
export default function HomeIntegrations() {
  return (
    <section aria-labelledby="cal-integrations-heading" className="cal-section omentir-primary-width">
      <Reveal className="cal-intro">
        <h2 id="cal-integrations-heading" className="cal-h2-xl">
          Connect Omentir to the tools you already use
        </h2>
        <p className="cal-lead">
          Run your LinkedIn outreach from your AI assistant, your editor, or your own code.
        </p>
        <Link href="/integrations" className="cal-underline-link mt-6">
          View all integrations <span aria-hidden="true">&rarr;</span>
        </Link>
      </Reveal>

      <Reveal className="cal-logo-grid">
        {LOGOS.map((slug) => (
          <Link key={slug} href="/integrations" className="cal-logo-tile">
            <IntegrationMark slug={slug} />
          </Link>
        ))}
      </Reveal>

      <Reveal className="cal-integration-cards">
        <div className="cal-card">
          <h3>AI assistants</h3>
          <p className="cal-muted">
            Ask Claude, ChatGPT or Grok to find leads, check replies and draft answers through the
            Omentir MCP server.
          </p>
        </div>
        <div className="cal-card">
          <h3>Developer tools</h3>
          <p className="cal-muted">
            Use Claude Code, Cursor, Codex or the REST Agent API to script agents and pull your
            data.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
