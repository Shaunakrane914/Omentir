// The whole product (marketing site and app) follows this preference; see
// the "Site theme" block in globals.css.
export const SITE_THEME_STORAGE_KEY = "omentir-site-theme";

export type SiteTheme = "light" | "dark";

/** Signed-in app pages (the (app) route group) default to dark. Everything
 *  else, including the marketing site, auth and /onboarding, defaults to
 *  light. */
export const DARK_DEFAULT_PREFIXES = [
  "/overview", "/dashboard", "/actions", "/activity", "/agents", "/api-keys",
  "/campaigns", "/leads", "/messages", "/my-product", "/settings", "/workspace",
];

export function defaultThemeFor(pathname: string): SiteTheme {
  return DARK_DEFAULT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))
    ? "dark"
    : "light";
}

/** An explicit Light/Dark pick wins everywhere; "system" follows the OS;
 *  no stored pick means the route's default. */
export function resolveSiteTheme(saved: string | null, pathname: string, prefersLight: boolean): SiteTheme {
  if (saved === "light" || saved === "dark") return saved;
  if (saved === "system") return prefersLight ? "light" : "dark";
  return defaultThemeFor(pathname);
}

/** Runs in <head> before paint so a light visitor never sees a dark flash.
 *  Mirrors resolveSiteTheme; SiteThemeSync re-applies it on client-side
 *  navigation and OS changes. */
export function siteThemeScript() {
  const key = JSON.stringify(SITE_THEME_STORAGE_KEY);
  const prefixes = JSON.stringify(DARK_DEFAULT_PREFIXES);
  return `(function(){try{var k=${key},x=${prefixes},d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: light)");var p=localStorage.getItem(k),u=location.pathname,r;if(p==="light"||p==="dark")r=p;else if(p==="system")r=m.matches?"light":"dark";else r=x.some(function(s){return u===s||u.indexOf(s+"/")===0})?"dark":"light";d.setAttribute("data-site-theme",r);d.style.colorScheme=r;}catch(e){}})();`;
}
