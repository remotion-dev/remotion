"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatNumber } from "../../model/values";

export const FieldRow: React.FC<{
  readonly label: React.ReactNode;
  readonly children: React.ReactNode;
  readonly badge?: React.ReactNode;
  readonly className?: string;
}> = ({ label, children, badge, className }) => (
  <div
    className={cn(
      "grid grid-cols-[88px_minmax(0,1fr)] items-center gap-2",
      className,
    )}
  >
    <div className="text-muted-foreground min-w-0 truncate text-[11px]">
      {label}
    </div>
    <div className="flex min-w-0 items-center gap-1.5">
      {children}
      {badge}
    </div>
  </div>
);

export const StatusBadge: React.FC<{
  readonly status: "keyframed" | "computed";
}> = ({ status }) => (
  <span
    title={
      status === "keyframed"
        ? "This value is animated with interpolate(). Edit the keyframes in the code."
        : "This value is computed in code and cannot be edited here."
    }
    className={cn(
      "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
      status === "keyframed"
        ? "bg-violet-500/15 text-violet-300"
        : "bg-muted text-muted-foreground",
    )}
  >
    {status === "keyframed" ? "animated" : "computed"}
  </span>
);

/**
 * A numeric input whose label can be dragged horizontally to scrub the value,
 * like in motion graphics tools. While dragging, `onLiveChange` previews the
 * value; the value is committed when the drag ends and on blur / Enter.
 */
export const NumberField: React.FC<{
  readonly value: number | null;
  readonly placeholder?: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly integer?: boolean;
  readonly unit?: string;
  readonly disabled?: boolean;
  readonly onCommit: (value: number | null) => void;
  readonly onLiveChange?: (value: number) => void;
  readonly ariaLabel: string;
  readonly className?: string;
  readonly allowEmpty?: boolean;
}> = ({
  value,
  placeholder,
  min,
  max,
  step = 1,
  integer = false,
  unit,
  disabled,
  onCommit,
  onLiveChange,
  ariaLabel,
  className,
  allowEmpty = false,
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const dragRef = useRef<{
    startX: number;
    startValue: number;
    previewed: boolean;
  } | null>(null);

  const normalize = (raw: number) => {
    let next = raw;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    if (integer || step >= 1) next = Math.round(next);
    return Number(next.toFixed(4));
  };

  const commitDraft = () => {
    if (draft === null) {
      return;
    }

    const trimmed = draft.trim();
    setDraft(null);
    if (trimmed === "") {
      if (allowEmpty) {
        onCommit(null);
      }

      return;
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed) && parsed !== value) {
      onCommit(normalize(parsed));
    }
  };

  return (
    <div className={cn("relative flex min-w-0 flex-1 items-center", className)}>
      <div
        className={cn(
          "scrub-label absolute inset-y-0 left-0 z-10 w-3 rounded-l-md",
          disabled ? "pointer-events-none" : "hover:bg-primary/30",
        )}
        title="Drag to change"
        onPointerDown={(event) => {
          if (disabled) return;
          event.preventDefault();
          dragRef.current = {
            startX: event.clientX,
            startValue: value ?? 0,
            previewed: false,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          const pixels = event.clientX - drag.startX;
          const multiplier = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
          const next = normalize(drag.startValue + pixels * step * multiplier);
          setDraft(String(next));
          if (onLiveChange) {
            drag.previewed = true;
            onLiveChange(next);
          }
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
          if (!drag) return;
          const pixels = event.clientX - drag.startX;
          const multiplier = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
          const next = normalize(drag.startValue + pixels * step * multiplier);
          setDraft(null);
          // A previewed value is committed even if it ends up unchanged so
          // that the preview is released.
          if (next !== value || drag.previewed) {
            onCommit(next);
          }
        }}
      />
      <Input
        aria-label={ariaLabel}
        inputMode="decimal"
        disabled={disabled}
        className={cn("pl-4 font-mono tabular-nums", unit && "pr-7")}
        placeholder={placeholder}
        value={draft ?? (value === null ? "" : formatNumber(value, 4))}
        onFocus={(event) => {
          setDraft(value === null ? "" : formatNumber(value, 4));
          event.target.select();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            setDraft(null);
            event.currentTarget.blur();
          } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            const direction = event.key === "ArrowUp" ? 1 : -1;
            const multiplier = event.shiftKey ? 10 : 1;
            const base =
              draft !== null && draft !== "" ? Number(draft) : (value ?? 0);
            const next = normalize(base + direction * step * multiplier);
            setDraft(String(next));
            onCommit(next);
          }
        }}
      />
      {unit ? (
        <span className="text-muted-foreground-dim pointer-events-none absolute right-2 text-[10px]">
          {unit}
        </span>
      ) : null}
    </div>
  );
};

export const TextField: React.FC<{
  readonly value: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly multiline?: boolean;
  readonly mono?: boolean;
  readonly ariaLabel: string;
  readonly onCommit: (value: string) => void;
}> = ({
  value,
  placeholder,
  disabled,
  multiline,
  mono,
  ariaLabel,
  onCommit,
}) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft !== value) {
      onCommit(draft);
    }
  };

  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        disabled={disabled}
        rows={Math.min(6, Math.max(2, draft.split("\n").length))}
        className={cn(
          "bg-input border-border focus-visible:border-ring w-full resize-y rounded-md border px-2 py-1 text-xs outline-none disabled:opacity-50",
          mono && "font-mono",
        )}
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.currentTarget.blur();
          }
        }}
      />
    );
  }

  return (
    <Input
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(mono && "font-mono")}
      placeholder={placeholder}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        } else if (event.key === "Escape") {
          setDraft(value);
          event.currentTarget.blur();
        }
      }}
    />
  );
};

const toHexColor = (value: string): string | null => {
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  if (typeof document === "undefined") {
    return null;
  }

  // Let the browser resolve named colors, rgb() etc.
  const probe = document.createElement("span");
  probe.style.color = value;
  if (!probe.style.color) {
    return null;
  }

  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  const match = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return null;
  }

  return `#${[match[1], match[2], match[3]]
    .map((channel) => Number(channel).toString(16).padStart(2, "0"))
    .join("")}`;
};

export const ColorField: React.FC<{
  readonly value: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly ariaLabel: string;
  readonly onCommit: (value: string) => void;
  readonly onLiveChange?: (value: string) => void;
}> = ({ value, placeholder, disabled, ariaLabel, onCommit, onLiveChange }) => {
  const hex = toHexColor(value || placeholder || "") ?? "#000000";
  const previewed = useRef(false);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <label
        className={cn(
          "border-border relative size-7 shrink-0 overflow-hidden rounded-md border",
          disabled ? "opacity-50" : "cursor-pointer",
        )}
        style={{
          background: value || placeholder || "transparent",
          backgroundImage:
            value || placeholder
              ? undefined
              : "repeating-conic-gradient(#333 0% 25%, #111 0% 50%) 50% / 8px 8px",
        }}
      >
        <input
          type="color"
          aria-label={`${ariaLabel} picker`}
          disabled={disabled}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          value={hex}
          onChange={(event) => {
            // The picker fires continuously while a color is being chosen.
            // Preview it and commit once the picker closes.
            if (onLiveChange) {
              previewed.current = true;
              onLiveChange(event.target.value);
            }
          }}
          onBlur={(event) => {
            const wasPreviewed = previewed.current;
            previewed.current = false;
            if (wasPreviewed || event.target.value !== toHexColor(value)) {
              onCommit(event.target.value);
            }
          }}
        />
      </label>
      <TextField
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        mono
        ariaLabel={ariaLabel}
        onCommit={onCommit}
      />
    </div>
  );
};

export const BooleanField: React.FC<{
  readonly value: boolean;
  readonly disabled?: boolean;
  readonly ariaLabel: string;
  readonly onCommit: (value: boolean) => void;
}> = ({ value, disabled, ariaLabel, onCommit }) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    aria-label={ariaLabel}
    disabled={disabled}
    onClick={() => onCommit(!value)}
    className={cn(
      "relative h-5 w-9 shrink-0 rounded-full border transition-colors disabled:opacity-50",
      value ? "bg-primary border-primary" : "bg-muted border-border",
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 size-3.5 rounded-full bg-white shadow transition-transform",
        value ? "translate-x-4" : "translate-x-0.5",
      )}
    />
  </button>
);

export const SelectField: React.FC<{
  readonly value: string;
  readonly options: readonly { value: string; label: string }[];
  readonly disabled?: boolean;
  readonly ariaLabel: string;
  readonly onCommit: (value: string) => void;
}> = ({ value, options, disabled, ariaLabel, onCommit }) => (
  <Select value={value} onValueChange={onCommit} disabled={disabled}>
    <SelectTrigger size="sm" aria-label={ariaLabel} className="w-full">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
