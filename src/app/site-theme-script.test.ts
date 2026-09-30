import { describe, expect, test } from "bun:test";
import { SITE_THEME_STORAGE_KEY, resolveSiteTheme, siteThemeScript } from "./site-theme-script";

describe("resolveSiteTheme", () => {
  test("visitors with no pick see the marketing site, auth and onboarding in light", () => {
    for (const path of ["/", "/pricing", "/blogs/some-post", "/login", "/signup", "/onboarding", "/onboarding/step"]) {
      expect(resolveSiteTheme(null, path, false)).toBe("light");
    }
  });

  test("signed-in app pages default to dark, even when the OS is light", () => {
    for (const path of ["/overview", "/leads/abc", "/messages", "/settings", "/agents/new"]) {
      expect(resolveSiteTheme(null, path, true)).toBe("dark");
    }
  });

  test("a prefix only matches whole segments, so a marketing slug like /leadsy stays light", () => {
    expect(resolveSiteTheme(null, "/leadsy", false)).toBe("light");
  });

  test("an explicit Light or Dark pick overrides the route default everywhere", () => {
    expect(resolveSiteTheme("dark", "/pricing", true)).toBe("dark");
    expect(resolveSiteTheme("light", "/overview", false)).toBe("light");
  });

  test("System follows the OS instead of the route default", () => {
    expect(resolveSiteTheme("system", "/overview", true)).toBe("light");
    expect(resolveSiteTheme("system", "/pricing", false)).toBe("dark");
  });
});

describe("siteThemeScript", () => {
  // The head script is a hand-written copy of resolveSiteTheme. If they drift,
  // the page paints one theme and flips to the other after hydration.
  function runScript(saved: string | null, pathname: string, prefersLight: boolean) {
    const attrs: Record<string, string> = {};
    const documentElement = { setAttribute: (k: string, v: string) => (attrs[k] = v), style: {} as Record<string, string> };
    const localStorage = { getItem: (k: string) => (k === SITE_THEME_STORAGE_KEY ? saved : null) };
    const window = { matchMedia: () => ({ matches: prefersLight }) };
    new Function("document", "localStorage", "window", "location", siteThemeScript())(
      { documentElement },
      localStorage,
      window,
      { pathname },
    );
    return attrs["data-site-theme"];
  }

  test("paints the same theme resolveSiteTheme picks", () => {
    const cases: Array<[string | null, string, boolean]> = [
      [null, "/", false],
      [null, "/onboarding", false],
      [null, "/overview", true],
      [null, "/leads/abc", true],
      [null, "/leadsy", false],
      ["dark", "/pricing", true],
      ["light", "/overview", false],
      ["system", "/overview", true],
      ["system", "/pricing", false],
    ];
    for (const [saved, path, prefersLight] of cases) {
      expect(runScript(saved, path, prefersLight)).toBe(resolveSiteTheme(saved, path, prefersLight));
    }
  });
});
