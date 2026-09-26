"use client";

import {
  getCanvasSelectionItemKey,
  useCanvasSelection,
  useCanvasSequenceHover,
} from "@remotion/canvas";
import { getNodeProps } from "@remotion/codemods";
import {
  FilmIcon,
  ImageIcon,
  LayersIcon,
  Music2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { usePlaybackFrame } from "../../hooks/use-playback";
import { getErrorMessage } from "../../hooks/use-preview-host";
import {
  getLayerLabel,
  getNodeReference,
  type Layer,
} from "../../model/layers";
import { getLayerSchema, hasTimingProps } from "../../model/schemas";
import { clamp, formatTimecode } from "../../model/values";
import { useEditor } from "../../state/editor-context";
import { fallbackSelectionController } from "../../state/fallback-selection";
import { LayerContextMenu } from "../Inspector/LayerActions";
import { ToolbarButton } from "../TopBar";

const LABEL_WIDTH = 220;
const RULER_HEIGHT = 26;
const ROW_HEIGHT = 30;
const EDGE_WIDTH = 7;

type DragState = {
  layerId: string;
  mode: "move" | "start" | "end";
  startX: number;
  deltaFrames: number;
  // Timeline geometry when the drag started. The preview moves the sequence
  // live, so the bar is drawn from these values instead of the live track.
  startFrom: number;
  startDuration: number;
};

const getTickInterval = (pxPerFrame: number, fps: number) => {
  const candidates = [
    1,
    2,
    5,
    10,
    fps / 2,
    fps,
    fps * 2,
    fps * 5,
    fps * 10,
    fps * 30,
    fps * 60,
  ].filter((value) => Number.isInteger(value) && value > 0);
  return (
    candidates.find((interval) => interval * pxPerFrame >= 70) ??
    candidates.at(-1)!
  );
};

const TypeIcon: React.FC<{ readonly layer: Layer }> = ({ layer }) => {
  const className = "size-3 shrink-0 opacity-70";
  switch (layer.track.sequence.type) {
    case "video":
      return <FilmIcon className={className} />;
    case "audio":
      return <Music2Icon className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    default:
      return <LayersIcon className={className} />;
  }
};

const Playhead: React.FC<{
  readonly pxPerFrame: number;
  readonly height: number;
}> = ({ pxPerFrame, height }) => {
  const { playback } = useEditor();
  const frame = usePlaybackFrame(playback);

  return (
    <div
      className="pointer-events-none absolute top-0 z-30"
      style={{
        left: LABEL_WIDTH + frame * pxPerFrame,
        height,
        width: 1,
        backgroundColor: "#f43f5e",
      }}
    >
      <div
        className="absolute -top-0 left-1/2 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent"
        style={{ borderTopColor: "#f43f5e" }}
      />
    </div>
  );
};

const TrackRow = memo(function TrackRow({
  layer,
  index,
  pxPerFrame,
  durationInFrames,
  selected,
  drag,
  onPointerDownBar,
}: {
  readonly layer: Layer;
  readonly index: number;
  readonly pxPerFrame: number;
  readonly durationInFrames: number;
  readonly selected: boolean;
  readonly drag: DragState | null;
  readonly onPointerDownBar: (
    event: React.PointerEvent,
    layer: Layer,
    mode: DragState["mode"],
  ) => void;
}) {
  const { host, actions } = useEditor();
  const { hovered, onPointerEnter, onPointerLeave } = useCanvasSequenceHover(
    host!.controller.hover,
    layer.nodePathInfo,
    "timeline",
  );
  const { sequence, depth } = layer.track;
  const schema = getLayerSchema(layer);
  const editable = layer.source !== null && hasTimingProps(schema);
  const isDragging = drag?.layerId === sequence.id;
  const delta = isDragging ? drag.deltaFrames : 0;
  const baseFrom = isDragging ? drag.startFrom : sequence.from;
  const baseDuration = isDragging ? drag.startDuration : sequence.duration;
  const from = baseFrom + (isDragging && drag.mode !== "end" ? delta : 0);
  const duration = Math.max(
    1,
    isDragging && drag.mode === "start"
      ? baseDuration - delta
      : isDragging && drag.mode === "end"
        ? baseDuration + delta
        : baseDuration,
  );
  const label = getLayerLabel(layer);
  const select = (event: React.MouseEvent) =>
    actions.selectLayer(layer, {
      shiftKey: event.shiftKey,
      toggleKey: event.metaKey || event.ctrlKey,
    });

  return (
    <LayerContextMenu layer={layer}>
      <div
        role="row"
        aria-selected={selected}
        className={cn(
          "group flex",
          selected ? "bg-selection-dim/40" : hovered ? "bg-accent/40" : "",
        )}
        style={{ height: ROW_HEIGHT }}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div
          className={cn(
            "bg-background-panel border-border-dim sticky left-0 z-20 flex shrink-0 items-center gap-1.5 border-r border-b pr-2 text-xs",
            selected && "bg-[#141a2a]",
          )}
          style={{ width: LABEL_WIDTH, paddingLeft: 10 + depth * 14 }}
          onClick={select}
          onDoubleClick={() => {
            if (layer.source) {
              actions.reveal(
                layer.source.filePath,
                layer.source.location?.line ?? null,
                layer.source.location?.column ?? null,
              );
            }
          }}
        >
          <TypeIcon layer={layer} />
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              selected
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            {label}
          </span>
          {!layer.source ? (
            <span
              className="text-muted-foreground-dim shrink-0 text-[9px] uppercase"
              title="This layer has no source location, so it cannot be edited here."
            >
              no source
            </span>
          ) : null}
        </div>
        <div
          className="border-border-dim relative min-w-0 flex-1 border-b"
          style={{ width: durationInFrames * pxPerFrame }}
          data-track-area
          data-row-index={index}
        >
          <div
            role="button"
            tabIndex={-1}
            aria-label={`${label}: from frame ${from}, ${duration} frames`}
            className={cn(
              "absolute top-[5px] flex h-[20px] items-center overflow-hidden rounded-[4px] border text-[10px] whitespace-nowrap select-none",
              editable
                ? "cursor-grab active:cursor-grabbing"
                : "cursor-default",
              selected
                ? "border-selection bg-selection/70 text-white"
                : hovered
                  ? "border-[#4b6383] bg-[#2f4160] text-white"
                  : sequence.type === "audio"
                    ? "border-emerald-900 bg-emerald-950/80 text-emerald-100"
                    : sequence.type === "video" || sequence.type === "image"
                      ? "border-violet-900 bg-violet-950/80 text-violet-100"
                      : "border-[#334155] bg-[#1e293b] text-slate-200",
              isDragging && "opacity-80 ring-1 ring-white/40",
            )}
            style={{
              left: from * pxPerFrame,
              width: Math.max(4, duration * pxPerFrame),
            }}
            onClick={select}
            onPointerDown={(event) => {
              if (event.button !== 0) {
                return;
              }

              if (!editable) {
                return;
              }

              const rect = event.currentTarget.getBoundingClientRect();
              const offset = event.clientX - rect.left;
              const mode: DragState["mode"] =
                offset <= EDGE_WIDTH && rect.width > EDGE_WIDTH * 3
                  ? "start"
                  : rect.width - offset <= EDGE_WIDTH &&
                      rect.width > EDGE_WIDTH * 3
                    ? "end"
                    : "move";
              onPointerDownBar(event, layer, mode);
            }}
          >
            {editable ? (
              <>
                <div className="absolute top-0 left-0 h-full w-[7px] cursor-ew-resize" />
                <div className="absolute top-0 right-0 h-full w-[7px] cursor-ew-resize" />
              </>
            ) : null}
            <span className="truncate px-2">
              {isDragging
                ? `${from} · ${duration}f`
                : duration * pxPerFrame > 60
                  ? `${label}`
                  : ""}
            </span>
          </div>
        </div>
      </div>
    </LayerContextMenu>
  );
});

export const Timeline: React.FC = () => {
  const {
    host,
    layers,
    composition,
    playback,
    actions,
    state,
    project,
    dispatch,
  } = useEditor();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(800);
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const durationInFrames = composition?.durationInFrames ?? 1;
  const fps = composition?.fps ?? 30;
  const basePxPerFrame = Math.max(
    0.05,
    (width - LABEL_WIDTH - 16) / durationInFrames,
  );
  const pxPerFrame = basePxPerFrame * zoom;
  const timelineWidth = durationInFrames * pxPerFrame;
  const { inFrame, outFrame } = state.playback;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const selection = useCanvasSelection(
    host?.controller.selection ?? fallbackSelectionController,
  );
  const selectedKeys = useMemo(
    () => new Set(selection.selectedItems.map(getCanvasSelectionItemKey)),
    [selection.selectedItems],
  );

  const frameFromClientX = useCallback(
    (clientX: number) => {
      const element = scrollRef.current;
      if (!element) {
        return 0;
      }

      const rect = element.getBoundingClientRect();
      const x = clientX - rect.left + element.scrollLeft - LABEL_WIDTH;
      return clamp(Math.round(x / pxPerFrame), 0, durationInFrames - 1);
    },
    [durationInFrames, pxPerFrame],
  );

  const scrub = useCallback(
    (event: React.PointerEvent) => {
      playback.getPlayer()?.pause();
      actions.seek(frameFromClientX(event.clientX));
    },
    [actions, frameFromClientX, playback],
  );

  const onPointerDownBar = useCallback(
    (event: React.PointerEvent, layer: Layer, mode: DragState["mode"]) => {
      const start: DragState = {
        layerId: layer.track.sequence.id,
        mode,
        startX: event.clientX,
        deltaFrames: 0,
        startFrom: layer.track.sequence.from,
        startDuration: layer.track.sequence.duration,
      };
      dragRef.current = start;
      const target = event.currentTarget as HTMLElement;
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Capture is an optimization; the window listeners below track the
        // pointer either way.
      }

      // The props as written in the source. Dragging previews and then
      // commits these values shifted by the dragged distance.
      const node = getNodeReference(layer.selectionItem);
      let sourceFrom = 0;
      let sourceDuration = layer.track.sequence.duration;
      let blocked: string | null = null;
      if (node) {
        try {
          const { props } = getNodeProps({
            project,
            node,
            keys: ["from", "durationInFrames"],
          });
          const fromStatus = props.from;
          const durationStatus = props.durationInFrames;
          if (fromStatus?.status === "computed" && mode !== "end") {
            blocked = `The "from" prop of ${getLayerLabel(layer)} is computed. Edit it in the code instead.`;
          } else if (durationStatus?.status === "computed" && mode !== "move") {
            blocked = `The "durationInFrames" prop of ${getLayerLabel(layer)} is computed. Edit it in the code instead.`;
          }

          if (
            fromStatus?.status === "static" &&
            typeof fromStatus.codeValue === "number"
          ) {
            sourceFrom = fromStatus.codeValue;
          }

          if (
            durationStatus?.status === "static" &&
            typeof durationStatus.codeValue === "number"
          ) {
            sourceDuration = durationStatus.codeValue;
          }
        } catch (error) {
          blocked = getErrorMessage(error);
        }
      }

      const getUpdates = (deltaFrames: number) =>
        mode === "move"
          ? [{ key: "from", value: sourceFrom + deltaFrames, defaultValue: 0 }]
          : mode === "end"
            ? [
                {
                  key: "durationInFrames",
                  value: Math.max(1, sourceDuration + deltaFrames),
                  defaultValue: null,
                },
              ]
            : [
                {
                  key: "from",
                  value: sourceFrom + deltaFrames,
                  defaultValue: 0,
                },
                {
                  key: "durationInFrames",
                  value: Math.max(1, sourceDuration - deltaFrames),
                  defaultValue: null,
                },
              ];

      const onMove = (move: PointerEvent) => {
        const current = dragRef.current;
        if (!current) {
          return;
        }

        const deltaFrames = Math.round(
          (move.clientX - current.startX) / pxPerFrame,
        );
        if (deltaFrames === current.deltaFrames) {
          return;
        }

        const next = { ...current, deltaFrames };
        dragRef.current = next;
        setDrag(deltaFrames === 0 ? null : next);
        if (node && blocked === null) {
          actions.previewLayerProps(
            layer,
            Object.fromEntries(
              getUpdates(deltaFrames).map(({ key, value }) => [key, value]),
            ),
          );
        }
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        const current = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (!current || current.deltaFrames === 0 || !node || !layer.source) {
          actions.cancelLayerPreview(layer);
          return;
        }

        if (blocked !== null) {
          actions.notifyError(new Error(blocked));
          return;
        }

        void actions.commitLayerProps(
          layer,
          getUpdates(current.deltaFrames),
          getLayerSchema(layer),
        );
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [actions, project, pxPerFrame],
  );

  const ticks = useMemo(() => {
    const interval = getTickInterval(pxPerFrame, fps);
    const result: { frame: number; label: string; major: boolean }[] = [];
    for (let frame = 0; frame <= durationInFrames; frame += interval) {
      result.push({
        frame,
        label:
          interval >= fps ? formatTimecode(frame, fps).slice(3) : String(frame),
        major: true,
      });
    }

    return result;
  }, [durationInFrames, fps, pxPerFrame]);

  if (!host) {
    return null;
  }

  const contentHeight = RULER_HEIGHT + layers.length * ROW_HEIGHT;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border flex h-8 shrink-0 items-center gap-2 border-b px-3 text-xs">
        <span className="font-medium">Timeline</span>
        <span className="text-muted-foreground">
          {layers.length} layer{layers.length === 1 ? "" : "s"}
          {selection.selectedItems.length > 0
            ? ` · ${selection.selectedItems.length} selected`
            : ""}
        </span>
        <span className="flex-1" />
        <span className="text-muted-foreground-dim hidden font-mono text-[10px] lg:inline">
          Drag a layer to move it · drag its edges to trim · ⌥ + scroll to zoom
        </span>
        <ToolbarButton
          size="icon-xs"
          label="Zoom out timeline"
          onClick={() => setZoom((value) => Math.max(1, value / 1.5))}
          disabled={zoom <= 1}
        >
          <ZoomOutIcon />
        </ToolbarButton>
        <ToolbarButton
          size="icon-xs"
          label="Zoom in timeline"
          onClick={() => setZoom((value) => Math.min(40, value * 1.5))}
        >
          <ZoomInIcon />
        </ToolbarButton>
      </div>
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-auto"
        onWheel={(event) => {
          if (event.altKey || event.ctrlKey) {
            event.preventDefault();
            setZoom((value) =>
              clamp(value * (event.deltaY < 0 ? 1.15 : 1 / 1.15), 1, 40),
            );
          }
        }}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          if (
            event.button === 0 &&
            target.closest("[data-track-area]") &&
            !target.closest('[role="button"]')
          ) {
            actions.clearSelection();
            scrub(event);
          }
        }}
      >
        <div
          className="relative"
          style={{
            width: LABEL_WIDTH + timelineWidth,
            minWidth: "100%",
            height: contentHeight,
          }}
        >
          <div
            className="bg-background-panel sticky top-0 z-40 flex"
            style={{ height: RULER_HEIGHT }}
          >
            <div
              className="bg-background-panel border-border sticky left-0 z-50 shrink-0 border-r border-b"
              style={{ width: LABEL_WIDTH }}
            />
            <div
              role="slider"
              aria-label="Timeline ruler"
              aria-valuemin={0}
              aria-valuemax={durationInFrames - 1}
              aria-valuenow={playback.getSnapshot().frame}
              tabIndex={-1}
              className="border-border relative flex-1 cursor-col-resize border-b select-none"
              style={{ width: timelineWidth }}
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }

                const target = event.currentTarget;
                target.setPointerCapture(event.pointerId);
                scrub(event);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  scrub(event);
                }
              }}
              onPointerUp={(event) =>
                event.currentTarget.releasePointerCapture(event.pointerId)
              }
            >
              {ticks.map((tick) => (
                <div
                  key={tick.frame}
                  className="text-muted-foreground-dim absolute bottom-0 flex flex-col items-start font-mono text-[9px]"
                  style={{ left: tick.frame * pxPerFrame }}
                >
                  <span className="translate-x-1 leading-none">
                    {tick.label}
                  </span>
                  <div className="bg-border mt-0.5 h-1.5 w-px" />
                </div>
              ))}
              {inFrame !== null ? (
                <InOutHandle
                  kind="in"
                  frame={inFrame}
                  pxPerFrame={pxPerFrame}
                  onChange={(frame) =>
                    actions.setInOut(
                      frame,
                      outFrame !== null && outFrame <= frame ? null : outFrame,
                    )
                  }
                  frameFromClientX={frameFromClientX}
                />
              ) : null}
              {outFrame !== null ? (
                <InOutHandle
                  kind="out"
                  frame={outFrame}
                  pxPerFrame={pxPerFrame}
                  onChange={(frame) =>
                    actions.setInOut(
                      inFrame !== null && inFrame >= frame ? null : inFrame,
                      frame,
                    )
                  }
                  frameFromClientX={frameFromClientX}
                />
              ) : null}
            </div>
          </div>
          {layers.length === 0 ? (
            <div
              className="text-muted-foreground absolute flex items-center text-xs"
              style={{ left: LABEL_WIDTH + 12, top: RULER_HEIGHT + 10 }}
            >
              {composition
                ? "No layers are mounted at this point in time."
                : "Waiting for the preview…"}
            </div>
          ) : null}
          {layers.map((layer, index) => (
            <TrackRow
              key={layer.track.sequence.id}
              layer={layer}
              index={index}
              pxPerFrame={pxPerFrame}
              durationInFrames={durationInFrames}
              selected={selectedKeys.has(
                getCanvasSelectionItemKey(layer.selectionItem),
              )}
              drag={drag}
              onPointerDownBar={onPointerDownBar}
            />
          ))}
          {inFrame !== null && inFrame > 0 ? (
            <div
              className="pointer-events-none absolute top-0 z-20 bg-black/45"
              style={{
                left: LABEL_WIDTH,
                width: inFrame * pxPerFrame,
                height: contentHeight,
              }}
            />
          ) : null}
          {outFrame !== null && outFrame < durationInFrames - 1 ? (
            <div
              className="pointer-events-none absolute top-0 z-20 bg-black/45"
              style={{
                left: LABEL_WIDTH + (outFrame + 1) * pxPerFrame,
                width: (durationInFrames - outFrame - 1) * pxPerFrame,
                height: contentHeight,
              }}
            />
          ) : null}
          <Playhead pxPerFrame={pxPerFrame} height={contentHeight} />
        </div>
      </div>
      {state.layout.showTimeline && layers.some((layer) => !layer.source) ? (
        <button
          type="button"
          className="text-muted-foreground-dim hover:text-muted-foreground border-border border-t px-3 py-1 text-left text-[10px]"
          onClick={() =>
            dispatch({
              type: "set-layout",
              patch: { showInspector: true, inspectorTab: "inspector" },
            })
          }
        >
          Some layers have no source location and cannot be edited here. They
          are rendered by dependencies or by code the compiler did not process.
        </button>
      ) : null}
    </div>
  );
};

const InOutHandle: React.FC<{
  readonly kind: "in" | "out";
  readonly frame: number;
  readonly pxPerFrame: number;
  readonly onChange: (frame: number) => void;
  readonly frameFromClientX: (clientX: number) => number;
}> = ({ kind, frame, pxPerFrame, onChange, frameFromClientX }) => (
  <div
    role="slider"
    aria-label={kind === "in" ? "In point" : "Out point"}
    aria-valuenow={frame}
    tabIndex={-1}
    className="absolute top-0 z-10 flex h-full w-3 cursor-ew-resize items-end"
    style={{
      left: kind === "in" ? frame * pxPerFrame : (frame + 1) * pxPerFrame - 12,
      justifyContent: kind === "in" ? "flex-start" : "flex-end",
    }}
    onPointerDown={(event) => {
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={(event) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        onChange(frameFromClientX(event.clientX));
      }
    }}
    onPointerUp={(event) =>
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  >
    <div
      className="h-3 w-1.5 rounded-sm bg-amber-400"
      style={{ borderRadius: kind === "in" ? "2px 0 0 2px" : "0 2px 2px 0" }}
    />
  </div>
);
