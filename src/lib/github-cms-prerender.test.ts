import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const deploy = readFileSync(join(root, ".github/workflows/deploy-production.yml"), "utf8");
const ci = readFileSync(join(root, ".github/workflows/ci.yml"), "utf8");
const dockerfile = readFileSync(join(root, "Dockerfile"), "utf8");
const starButton = readFileSync(join(root, "src/app/github-star-button.tsx"), "utf8");

describe("GitHub CMS prerender", () => {
  test("configure Sanity on GitHub verify so production ships ~889 pages instead of 69", () => {
    // 892df9b compiled on the runner with no Sanity project id, so generateStaticParams
    // returned [] for every CMS family. The VPS then installed that 69-page .next.
    expect(deploy).toContain("SANITY_API_READ_TOKEN: ${{ secrets.SANITY_API_READ_TOKEN }}");
    expect(ci).toContain("SANITY_API_READ_TOKEN: ${{ secrets.SANITY_API_READ_TOKEN }}");
    expect(dockerfile).toContain("ARG NEXT_PUBLIC_SANITY_PROJECT_ID");
  });

  test("inlines the PostHog project key so Web Analytics pageviews survive VPS deploys", () => {
    // The VPS unpacks this job's .next. NEXT_PUBLIC_* is baked at compile time,
    // so a missing key means posthog-js never inits. Server events keep flowing
    // from VPS env, which is why AI citations still move while unique users freeze.
    // The value lives in GitHub secrets: a literal phc_ in yaml trips gitleaks.
    expect(deploy).toContain("NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}");
    expect(ci).toContain("NEXT_PUBLIC_POSTHOG_KEY: ${{ secrets.NEXT_PUBLIC_POSTHOG_KEY }}");
    expect(deploy).not.toMatch(/NEXT_PUBLIC_POSTHOG_KEY:\s*phc_/);
    expect(ci).not.toMatch(/NEXT_PUBLIC_POSTHOG_KEY:\s*phc_/);
    expect(deploy).toContain("Require PostHog project key");
  });

  test("authenticates the header star count on the runner so deployed pages show it", () => {
    // aff70d0 shipped every prerendered page with no GitHub star count. The shared
    // runner IP was over GitHub's 60/hour unauthenticated limit, so the header showed
    // a bare GitHub icon until the VPS regenerated each page, up to an hour later.
    expect(deploy).toContain("GITHUB_TOKEN: ${{ github.token }}");
    expect(starButton).toContain("process.env.GITHUB_TOKEN");
    expect(starButton).toContain("Authorization: `Bearer ${token}`");
  });
});
