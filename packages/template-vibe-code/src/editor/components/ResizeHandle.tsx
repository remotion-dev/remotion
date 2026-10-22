"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A draggable divider between two panels. `axis: "x"` resizes a width,
 * `axis: "y"` a height. Set `invert` when the panel sits on the far side of
 * the handle (right or bottom).
 */
export const ResizeHandle: React.FC<{
  readonly axis: "x" | "y";
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly invert?: boolean;
  readonly onChange: (value: number) => void;
}> = ({ axis, value, min, max, invert = false, onChange }) => {
  const dragRef = useRef<{ start: number; initial: number } | null>(null);

  return (
    <div
      role="separator"
      aria-orientation={axis === "x" ? "vertical" : "horizontal"}
      className={cn(
        "group relative z-10 shrink-0 select-none",
        axis === "x" ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
        "bg-border",
      )}
      onPointerDown={(event) => {
        event.preventDefault();
        dragRef.current = {
          start: axis === "x" ? event.clientX : event.clientY,
          initial: value,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) {
          return;
        }

        const current = axis === "x" ? event.clientX : event.clientY;
        const delta = (current - drag.start) * (invert ? -1 : 1);
        onChange(
          Math.round(Math.min(max, Math.max(min, drag.initial + delta))),
        );
      }}
      onPointerUp={(event) => {
        dragRef.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
        document.body.style.cursor = "";
      }}
    >
      <div
        className={cn(
          "absolute transition-colors group-hover:bg-primary/60 group-active:bg-primary",
          axis === "x"
            ? "-left-1 top-0 h-full w-[5px]"
            : "-top-1 left-0 h-[5px] w-full",
        )}
      />
    </div>
  );
};
