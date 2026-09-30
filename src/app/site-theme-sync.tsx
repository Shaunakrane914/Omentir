"use client";

import { useEffect } from "react";
import { SITE_THEME_STORAGE_KEY } from "./site-theme-script";

/** Re-applies the light/dark preference after mount. The <head> script
 *  normally sets data-site-theme before paint, but when React renders the
 *  root layout on the client (the 404 does) that inline script never runs
 *  and <html> loses the attribute, so the page fell back to dark. */
export default function SiteThemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const apply = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(SITE_THEME_STORAGE_KEY);
      } catch {
        // Storage blocked: follow the OS.
      }
      const theme = saved === "light" || saved === "dark" ? saved : media.matches ? "light" : "dark";
      root.setAttribute("data-site-theme", theme);
      root.style.colorScheme = theme;
    };
    if (!root.hasAttribute("data-site-theme")) apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return null;
}
