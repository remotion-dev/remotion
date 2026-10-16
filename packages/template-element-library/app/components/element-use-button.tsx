import { ArrowPathIcon, EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { setStudioDragData } from "@remotion/studio-protocol";
import type { DragEvent, RefObject } from "react";
import type { CatalogEntry } from "../../lib/element-payload";

export const ElementUseButton = ({
  entry,
  loading,
  sent,
  onClick,
  triggerRef,
}: {
  entry: CatalogEntry;
  loading: boolean;
  sent: boolean;
  onClick: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) => {
  const onDragStart = (event: DragEvent<HTMLElement>) => {
    setStudioDragData({
      dataTransfer: event.dataTransfer,
      payload: entry.payload,
    });
  };

  return (
    <div className="flex w-full items-stretch rounded-md bg-ink text-white">
      <button
        ref={triggerRef}
        type="button"
        className="relative flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-l-md px-3 text-base font-medium hover:bg-neutral-700 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-100"
        disabled={loading}
        aria-busy={loading}
        draggable
        onClick={onClick}
        onDragStart={onDragStart}
      >
        <span className={loading ? "opacity-0" : undefined}>
          {sent ? "Sent to Studio" : "Use"}
        </span>
        {loading && (
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <ArrowPathIcon className="size-4 shrink-0 animate-spin fill-current" />
          </span>
        )}
      </button>
      <div
        aria-label="Drag into Studio"
        title="Drag into Studio"
        className="flex min-h-12 w-12 shrink-0 cursor-grab items-center justify-center rounded-r-md border-l border-white/20 select-none hover:bg-neutral-700 active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
      >
        <span aria-hidden className="grid w-3 grid-cols-2 place-items-center">
          <EllipsisVerticalIcon className="size-4 shrink-0 fill-current" />
          <EllipsisVerticalIcon className="size-4 shrink-0 fill-current" />
        </span>
      </div>
    </div>
  );
};
