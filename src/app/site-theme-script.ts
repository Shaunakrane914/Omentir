// The whole product (marketing site and app) follows this preference; see
// the "Site theme" block in globals.css.
export const SITE_THEME_STORAGE_KEY = "omentir-site-theme";

export type SiteTheme = "light" | "dark";

/** Everyone starts in light, whatever their OS says. Only the visitor's own
 *  pick changes that: Light or Dark is used as is, and "system" follows the
 *  OS. */
export function resolveSiteTheme(saved: string | null, prefersLight: boolean): SiteTheme {
  if (saved === "light" || saved === "dark") return saved;
  if (saved === "system") return prefersLight ? "light" : "dark";
  return "light";
}

/** Runs in <head> before paint so a light visitor never sees a dark flash.
 *  Mirrors resolveSiteTheme; SiteThemeSync re-applies it on client-side
 *  navigation and OS changes. */
export function siteThemeScript() {
  const key = JSON.stringify(SITE_THEME_STORAGE_KEY);
  return `(function(){try{var k=${key},d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: light)");var p=localStorage.getItem(k),r;if(p==="light"||p==="dark")r=p;else if(p==="system")r=m.matches?"light":"dark";else r="light";d.setAttribute("data-site-theme",r);d.style.colorScheme=r;}catch(e){}})();`;
}
