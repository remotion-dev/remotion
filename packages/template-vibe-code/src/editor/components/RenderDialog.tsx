"use client";

import type {
  CanRenderMediaOnWebResult,
  WebRendererQuality,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PreviewMediaRenderRequest } from "@/preview/bridge";
import { FieldRow, NumberField, SelectField } from "./Inspector/fields";
import { useEditor } from "../state/editor-context";

const codecsByContainer: Record<"mp4" | "webm", WebRendererVideoCodec[]> = {
  mp4: ["h264", "h265", "av1"],
  webm: ["vp8", "vp9", "av1"],
};

export const RenderDialog: React.FC = () => {
  const { state, actions, host, composition, playback } = useEditor();
  const open = state.dialog === "render";
  const [kind, setKind] = useState<"media" | "still">("media");
  const [container, setContainer] = useState<"mp4" | "webm">("mp4");
  const [codec, setCodec] = useState<WebRendererVideoCodec | "auto">("auto");
  const [quality, setQuality] = useState<WebRendererQuality>("high");
  const [scale, setScale] = useState(1);
  const [useInOut, setUseInOut] = useState(true);
  const [muted, setMuted] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [frame, setFrame] = useState(0);
  const [check, setCheck] = useState<CanRenderMediaOnWebResult | null>(null);

  useEffect(() => {
    if (open) {
      setFrame(playback.getSnapshot().frame);
    }
  }, [open, playback]);

  const { inFrame, outFrame } = state.playback;
  const hasRange = inFrame !== null || outFrame !== null;
  const frameRange: [number, number] | null =
    useInOut && hasRange && composition
      ? [inFrame ?? 0, outFrame ?? composition.durationInFrames - 1]
      : null;

  const mediaRequest: PreviewMediaRenderRequest = {
    kind: "media",
    container,
    videoCodec: codec === "auto" ? null : codec,
    videoBitrate: quality,
    scale,
    frameRange,
    muted,
  };

  useEffect(() => {
    if (!open || kind !== "media" || !host || !composition) {
      setCheck(null);
      return;
    }

    let cancelled = false;
    host
      .canRenderMedia(mediaRequest)
      .then((result) => {
        if (!cancelled) {
          setCheck(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCheck(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, kind, host, composition, container, codec, quality, scale, muted]);

  if (!composition) {
    return null;
  }

  const outputWidth = Math.round(composition.width * scale);
  const outputHeight = Math.round(composition.height * scale);
  const frames = frameRange
    ? frameRange[1] - frameRange[0] + 1
    : composition.durationInFrames;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => actions.openDialog(next ? "render" : null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Render {composition.id}</DialogTitle>
          <DialogDescription>
            Rendered in your browser with WebCodecs. Longer compositions take a
            while — you can keep editing in the meantime.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={kind}
          onValueChange={(value) => setKind(value as "media" | "still")}
        >
          <TabsList className="px-0">
            <TabsTrigger value="media">Video</TabsTrigger>
            <TabsTrigger value="still">Still image</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2.5">
          {kind === "media" ? (
            <>
              <FieldRow label="Container">
                <SelectField
                  ariaLabel="Container"
                  value={container}
                  options={[
                    { value: "mp4", label: "MP4" },
                    { value: "webm", label: "WebM" },
                  ]}
                  onCommit={(value) => {
                    setContainer(value as "mp4" | "webm");
                    setCodec("auto");
                  }}
                />
              </FieldRow>
              <FieldRow label="Codec">
                <SelectField
                  ariaLabel="Video codec"
                  value={codec}
                  options={[
                    { value: "auto", label: "Automatic" },
                    ...codecsByContainer[container].map((value) => ({
                      value,
                      label: value.toUpperCase(),
                    })),
                  ]}
                  onCommit={(value) =>
                    setCodec(value as WebRendererVideoCodec | "auto")
                  }
                />
              </FieldRow>
              <FieldRow label="Quality">
                <SelectField
                  ariaLabel="Quality"
                  value={quality}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "very-high", label: "Very high" },
                  ]}
                  onCommit={(value) => setQuality(value as WebRendererQuality)}
                />
              </FieldRow>
            </>
          ) : (
            <>
              <FieldRow label="Frame">
                <NumberField
                  ariaLabel="Frame"
                  value={frame}
                  min={0}
                  max={composition.durationInFrames - 1}
                  integer
                  onCommit={(value) => setFrame(value ?? 0)}
                />
              </FieldRow>
              <FieldRow label="Format">
                <SelectField
                  ariaLabel="Image format"
                  value={format}
                  options={[
                    { value: "png", label: "PNG" },
                    { value: "jpeg", label: "JPEG" },
                  ]}
                  onCommit={(value) => setFormat(value as "png" | "jpeg")}
                />
              </FieldRow>
            </>
          )}
          <FieldRow label="Scale">
            <SelectField
              ariaLabel="Scale"
              value={String(scale)}
              options={[0.25, 0.5, 1, 2].map((value) => ({
                value: String(value),
                label: `${value}× (${Math.round(composition.width * value)}×${Math.round(composition.height * value)})`,
              }))}
              onCommit={(value) => setScale(Number(value))}
            />
          </FieldRow>
          {kind === "media" ? (
            <>
              <FieldRow label="Range">
                <SelectField
                  ariaLabel="Frame range"
                  value={hasRange && useInOut ? "in-out" : "full"}
                  disabled={!hasRange}
                  options={[
                    {
                      value: "full",
                      label: `Full composition (${composition.durationInFrames} frames)`,
                    },
                    {
                      value: "in-out",
                      label: hasRange
                        ? `In / out points (${inFrame ?? 0}–${outFrame ?? composition.durationInFrames - 1})`
                        : "In / out points (none set)",
                    },
                  ]}
                  onCommit={(value) => setUseInOut(value === "in-out")}
                />
              </FieldRow>
              <FieldRow label="Audio">
                <SelectField
                  ariaLabel="Audio"
                  value={muted ? "muted" : "included"}
                  options={[
                    { value: "included", label: "Include audio" },
                    { value: "muted", label: "Mute" },
                  ]}
                  onCommit={(value) => setMuted(value === "muted")}
                />
              </FieldRow>
            </>
          ) : null}
        </div>
        <div className="text-muted-foreground bg-muted/50 rounded-md p-2 font-mono text-[11px]">
          {outputWidth}×{outputHeight}
          {kind === "media"
            ? ` · ${frames} frames · ${(frames / composition.fps).toFixed(2)}s · ${composition.fps} fps`
            : ` · frame ${frame} · ${format.toUpperCase()}`}
        </div>
        {check && check.issues.length > 0 ? (
          <ul className="flex flex-col gap-1 text-[11px]">
            {check.issues.map((issue) => (
              <li
                key={issue.type}
                className={
                  issue.severity === "error"
                    ? "text-destructive-foreground"
                    : "text-warning"
                }
              >
                · {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.openDialog(null)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={kind === "media" && check !== null && !check.canRender}
            onClick={() => {
              actions.openDialog(null);
              void actions.startRender(
                kind === "media"
                  ? mediaRequest
                  : { kind: "still", frame, format, scale },
              );
            }}
          >
            Render
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
