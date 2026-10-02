import { describe, expect, test } from "bun:test";
import { SITE_THEME_STORAGE_KEY, resolveSiteTheme, siteThemeScript } from "./site-theme-script";

describe("resolveSiteTheme", () => {
  test("with no pick, everyone gets light, even when the OS is dark", () => {
    expect(resolveSiteTheme(null, false)).toBe("light");
    expect(resolveSiteTheme(null, true)).toBe("light");
  });

  test("an unknown stored value falls back to light instead of following the OS", () => {
    expect(resolveSiteTheme("blue", false)).toBe("light");
  });

  test("an explicit Light or Dark pick wins over the OS", () => {
    expect(resolveSiteTheme("dark", true)).toBe("dark");
    expect(resolveSiteTheme("light", false)).toBe("light");
  });

  test("only a System pick follows the OS", () => {
    expect(resolveSiteTheme("system", true)).toBe("light");
    expect(resolveSiteTheme("system", false)).toBe("dark");
  });
});

describe("siteThemeScript", () => {
  // The head script is a hand-written copy of resolveSiteTheme. If they drift,
  // the page paints one theme and flips to the other after hydration.
  function runScript(saved: string | null, prefersLight: boolean) {
    const attrs: Record<string, string> = {};
    const documentElement = { setAttribute: (k: string, v: string) => (attrs[k] = v), style: {} as Record<string, string> };
    const localStorage = { getItem: (k: string) => (k === SITE_THEME_STORAGE_KEY ? saved : null) };
    const window = { matchMedia: () => ({ matches: prefersLight }) };
    new Function("document", "localStorage", "window", siteThemeScript())({ documentElement }, localStorage, window);
    return attrs["data-site-theme"];
  }

  test("paints the same theme resolveSiteTheme picks", () => {
    const cases: Array<[string | null, boolean]> = [
      [null, false],
      [null, true],
      ["blue", false],
      ["dark", true],
      ["light", false],
      ["system", true],
      ["system", false],
    ];
    for (const [saved, prefersLight] of cases) {
      expect(runScript(saved, prefersLight)).toBe(resolveSiteTheme(saved, prefersLight));
    }
  });
});
