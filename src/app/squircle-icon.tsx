import FeatureIcon from "./feature-icon";
import type { FeatureNavIcon } from "./feature-nav";

/** A smooth squircle on a 56 unit box: four cubic curves, no corners. */
const SQUIRCLE = "M28 0C50 0 56 6 56 28S50 56 28 56 0 50 0 28 6 0 28 0Z";

export type SquircleTone = "blue" | "lime" | "lavender" | "orange" | "mint" | "muted";

/** Feature glyph on a tinted squircle tile, drawn in heavy navy strokes.
 *  `ring` adds the white outline used on the hero product tabs. */
export default function SquircleIcon({
  icon,
  tone,
  size = 36,
  ring = false,
  className = "",
}: {
  icon: FeatureNavIcon;
  tone: SquircleTone;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`squircle-icon is-${tone}${ring ? " has-ring" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox={ring ? "-5 -5 66 66" : "0 0 56 56"} className="squircle-icon-tile">
        <path d={SQUIRCLE} />
      </svg>
      <span className="squircle-icon-glyph">
        <FeatureIcon icon={icon} />
      </span>
    </span>
  );
}
