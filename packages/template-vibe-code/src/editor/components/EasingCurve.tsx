import type { CanvasKeyframeEasing } from "@remotion/sdk";
import React, { useMemo } from "react";
import { Easing } from "remotion";
import { cn } from "@/lib/utils";
import { clamp } from "../model/values";

// Springs overshoot, so the plot leaves room above 1 and below 0.
const Y_MIN = -0.35;
const Y_MAX = 1.45;
const SAMPLES = 48;

const getEasingFunction = (
  easing: CanvasKeyframeEasing,
): ((progress: number) => number) => {
  switch (easing.type) {
    case "linear":
      return Easing.linear;
    case "step1":
      return Easing.step1;
    case "bezier":
      return Easing.bezier(easing.x1, easing.y1, easing.x2, easing.y2);
    case "spring":
      return Easing.spring({
        allowTail: easing.allowTail ?? undefined,
        damping: easing.damping,
        durationRestThreshold: easing.durationRestThreshold ?? undefined,
        mass: easing.mass,
        overshootClamping: easing.overshootClamping,
        stiffness: easing.stiffness,
      });
    default:
      throw new Error(
        `Unsupported easing: ${JSON.stringify(easing satisfies never)}`,
      );
  }
};

const getEasingPath = (
  easing: CanvasKeyframeEasing,
  width: number,
  height: number,
  padding: number,
): string => {
  const x = (progress: number) => padding + progress * (width - padding * 2);
  const y = (value: number) =>
    padding +
    ((Y_MAX - clamp(value, Y_MIN, Y_MAX)) / (Y_MAX - Y_MIN)) *
      (height - padding * 2);

  if (easing.type === "step1") {
    return `M ${x(0)} ${y(0)} L ${x(1)} ${y(0)} L ${x(1)} ${y(1)}`;
  }

  const fn = getEasingFunction(easing);
  return Array.from({ length: SAMPLES + 1 }, (_, index) => {
    const progress = index / SAMPLES;
    return `${index === 0 ? "M" : "L"} ${x(progress)} ${y(fn(progress))}`;
  }).join(" ");
};

/** Plots an easing from its start value (bottom left) to its end value (top right). */
export const EasingCurve: React.FC<{
  readonly easing: CanvasKeyframeEasing;
  readonly width: number;
  readonly height: number;
  readonly className?: string;
  /** Draws the 0 and 1 guide lines, for the large graph of the inspector. */
  readonly guides?: boolean;
}> = ({ easing, width, height, className, guides = false }) => {
  const padding = 4;
  const path = useMemo(
    () => getEasingPath(easing, width, height, padding),
    [easing, height, width],
  );
  const guideY = (value: number) =>
    padding + ((Y_MAX - value) / (Y_MAX - Y_MIN)) * (height - padding * 2);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("block shrink-0", className)}
      aria-hidden
    >
      {guides ? (
        <>
          <line
            x1={padding}
            x2={width - padding}
            y1={guideY(0)}
            y2={guideY(0)}
            className="stroke-border"
            strokeWidth={1}
          />
          <line
            x1={padding}
            x2={width - padding}
            y1={guideY(1)}
            y2={guideY(1)}
            className="stroke-border"
            strokeWidth={1}
          />
        </>
      ) : null}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={guides ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
