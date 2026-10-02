"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SITE_THEME_STORAGE_KEY, resolveSiteTheme } from "./site-theme-script";

/** Re-applies the light/dark preference after mount, on every route change
 *  and when the OS theme changes (for visitors who picked "System"). It also
 *  covers the 404, where React renders the root layout on the client and the
 *  inline script never runs. */
export default function SiteThemeSync() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(SITE_THEME_STORAGE_KEY);
      } catch {
        // Storage blocked: use the light default.
      }
      const theme = resolveSiteTheme(saved, media.matches);
      root.setAttribute("data-site-theme", theme);
      root.style.colorScheme = theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [pathname]);
  return null;
}
