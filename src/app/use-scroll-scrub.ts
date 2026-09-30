"use client";

import { useEffect, useEffectEvent, useState, type RefObject } from "react";

const SCRUB_QUERY =
  "(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

/** True when the viewport is big enough for the scroll-driven homepage
 *  sections and the visitor has not asked for reduced motion. False on the
 *  server and first paint, so the plain click-to-switch layout renders first. */
export function useScrubEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(SCRUB_QUERY);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return enabled;
}

/** Calls `onFrame` at most once per animation frame while the page scrolls
 *  or resizes, with how many pixels the viewport top has moved past the top
 *  of `track` (negative before the track reaches the top). */
export function useScrollScrub(
  track: RefObject<HTMLElement | null>,
  enabled: boolean,
  onFrame: (scrolled: number) => void,
) {
  const frame = useEffectEvent(onFrame);

  useEffect(() => {
    if (!enabled) return;
    let pending: number | null = null;
    const run = () => {
      pending = null;
      const el = track.current;
      if (el) frame(-el.getBoundingClientRect().top);
    };
    const schedule = () => {
      if (pending === null) pending = window.requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (pending !== null) window.cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, track]);
}
