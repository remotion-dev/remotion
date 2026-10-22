import React from "react";
import { cn } from "@/lib/utils";

/** The keyframe marker used by the inspector and the timeline. */
export const KeyframeDiamond: React.FC<{
  readonly filled: boolean;
  readonly size?: number;
  readonly className?: string;
}> = ({ filled, size = 10, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 10"
    aria-hidden
    className={cn("block shrink-0", className)}
  >
    <path
      d="M5 0.7 L9.3 5 L5 9.3 L0.7 5 Z"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />
  </svg>
);
