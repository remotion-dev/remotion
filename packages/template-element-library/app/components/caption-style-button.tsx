import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { setStudioDragData } from "@remotion/studio-protocol";
import { useState, type RefObject } from "react";
import type { CatalogEntry } from "../../lib/element-payload";
import { RenderedPreview } from "./rendered-preview";

export const CaptionStyleButton = ({
  entry,
  isSelected,
  loading,
  onClick,
  triggerRef,
}: {
  entry: CatalogEntry;
  isSelected: boolean;
  loading: boolean;
  onClick: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-label={`Select ${entry.definition.displayName}`}
      aria-pressed={isSelected}
      aria-busy={loading}
      disabled={loading}
      className="group/caption grid w-full min-w-0 cursor-default gap-1 rounded-xl p-1 text-left text-ink ring-1 ring-ink/15 hover:bg-ink/5 focus-visible:outline-offset-2 aria-pressed:ring-2 aria-pressed:ring-accent aria-busy:opacity-100"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={onClick}
      draggable={!loading}
      onDragStart={(event) =>
        setStudioDragData({
          dataTransfer: event.dataTransfer,
          payload: entry.payload,
        })
      }
    >
      <div
        aria-hidden
        className="transparency-grid pointer-events-none flex aspect-video items-center overflow-hidden rounded-lg"
      >
        <RenderedPreview
          definition={entry.definition}
          playing={hovered || focused}
        />
      </div>
      <div className="flex min-w-0 items-center justify-between gap-2 px-2 py-2 text-base font-normal sm:text-sm">
        <span className="min-w-0 text-balance">
          {entry.definition.displayName}
        </span>
        <span
          className="flex size-4 shrink-0 items-center justify-center"
          aria-hidden
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-accent motion-reduce:animate-none" />
          ) : (
            <CheckCircleIcon className="size-4 shrink-0 fill-accent opacity-0 group-aria-pressed/caption:opacity-100" />
          )}
        </span>
      </div>
    </button>
  );
};
