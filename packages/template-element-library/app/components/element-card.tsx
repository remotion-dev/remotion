import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import { setStudioDragData } from "@remotion/studio-protocol";
import type { CatalogEntry } from "../../lib/element-payload";
import { RenderedPreview } from "./rendered-preview";
import { StudioActions } from "./studio-actions";

export const ElementCard = ({ entry }: { entry: CatalogEntry }) => {
  const { definition } = entry;
  const { search } = useOutletContext<{ search: string }>();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <li
      className="group/card relative min-w-0"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <Link
        className="grid gap-4 rounded-md"
        to={{ pathname: `/elements/${definition.slug}`, search }}
        draggable
        onDragStart={(event) =>
          setStudioDragData({
            dataTransfer: event.dataTransfer,
            payload: entry.payload,
          })
        }
      >
        <div
          className={`relative flex aspect-video items-center overflow-hidden rounded-[min(1vw,8px)] bg-neutral-50 outline-1 -outline-offset-1 outline-black/5 [&>div]:pointer-events-none ${definition.previewBackground === "transparent" ? "transparency-grid" : ""}`}
          aria-hidden
        >
          <RenderedPreview
            definition={definition}
            playing={hovered || focused}
          />
        </div>
        <div>
          <h2 className="text-lg font-normal text-balance sm:text-base">
            {definition.displayName}
          </h2>
        </div>
      </Link>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex aspect-video items-end justify-end p-3">
        <StudioActions entry={entry} variant="card" />
      </div>
    </li>
  );
};
