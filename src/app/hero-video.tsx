"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/hero/omentir-demo.mp4";
const POSTER_SRC = "/hero/omentir-demo-poster.png";

// Homepage hero film. Starts paused and muted, then loops once a visitor
// presses play. Sound stays off until someone turns it on.
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };

    updateDuration();
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("durationchange", updateDuration);
    return () => {
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("durationchange", updateDuration);
      if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    };
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && video.paused) {
      video.play().catch(() => {});
    }
  }

  function seekVideo(time: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }

  function clearControlsTimer() {
    if (controlsTimerRef.current !== null) window.clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = null;
  }

  function showControls(hideAfterMs?: number) {
    setControlsVisible(true);
    clearControlsTimer();
    if (hideAfterMs === undefined) return;

    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      controlsTimerRef.current = null;
    }, hideAfterMs);
  }

  function hideControlsAfterDelay() {
    clearControlsTimer();
    controlsTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      controlsTimerRef.current = null;
    }, 1000);
  }

  return (
    <div
      className={`hero-video-shell${controlsVisible ? " is-controls-visible" : ""}`}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const interactiveControls = event.currentTarget.querySelectorAll<HTMLElement>(
          ".hero-video-controls, .hero-video-progress",
        );
        const isOverControls = Array.from(interactiveControls).some((control) => {
          const bounds = control.getBoundingClientRect();
          return (
            event.clientX >= bounds.left &&
            event.clientX <= bounds.right &&
            event.clientY >= bounds.top &&
            event.clientY <= bounds.bottom
          );
        });
        if (isOverControls) {
          showControls();
          return;
        }
        showControls(1000);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") hideControlsAfterDelay();
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") showControls(2000);
      }}
    >
      <video
        ref={videoRef}
        className="hero-video-media"
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
      />
      <div
        className="hero-video-controls"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") showControls();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hideControlsAfterDelay();
        }}
      >
        <button
          type="button"
          className="hero-video-button"
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden="true">
            {playing ? (
              <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
            ) : (
              <path d="M8 5.5v13l10.5-6.5z" />
            )}
          </svg>
        </button>
        <button
          type="button"
          className="hero-video-button"
          onClick={toggleSound}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
        >
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
            {muted ? (
              <path d="M16 9.5l5 5M21 9.5l-5 5" />
            ) : (
              <path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
            )}
          </svg>
        </button>
      </div>
      <input
        type="range"
        className="hero-video-progress"
        min="0"
        max={duration || 1}
        step="any"
        value={duration ? Math.min(currentTime, duration) : 0}
        onChange={(event) => seekVideo(Number(event.currentTarget.value))}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") showControls();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hideControlsAfterDelay();
        }}
        aria-label="Video progress"
        style={
          {
            "--hero-video-progress": `${duration ? Math.min((currentTime / duration) * 100, 100) : 0}%`,
          } as CSSProperties
        }
      />
    </div>
  );
}
