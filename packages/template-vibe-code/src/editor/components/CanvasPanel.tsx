"use client";

import { Loader2Icon } from "lucide-react";
import React from "react";
import { useEditor } from "../state/editor-context";

export const CanvasPanel: React.FC<{
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;
}> = ({ iframeRef }) => {
  const { state, composition, hostError } = useEditor();
  const { compile } = state;
  const booting = compile.type === "booting" || hostError !== null;

  return (
    <div className="relative min-h-0 flex-1 bg-[#050608]">
      <iframe
        ref={iframeRef}
        title="Composition preview"
        allow="autoplay; fullscreen"
        className="absolute inset-0 h-full w-full border-0"
      />
      {composition ? (
        <div className="pointer-events-none absolute top-2 left-2 flex items-center gap-1.5 font-mono text-[10px] text-white/50">
          <span className="rounded bg-black/50 px-1.5 py-0.5 backdrop-blur">
            {composition.width}×{composition.height}
          </span>
          <span className="rounded bg-black/50 px-1.5 py-0.5 backdrop-blur">
            {composition.fps} fps
          </span>
          <span className="rounded bg-black/50 px-1.5 py-0.5 backdrop-blur">
            {composition.durationInFrames} frames
          </span>
        </div>
      ) : null}
      {compile.type === "compiling" ? (
        <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[10px] text-white/70 backdrop-blur">
          <Loader2Icon className="size-3 animate-spin" />
          Compiling
        </div>
      ) : null}
      {booting ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050608]/90 text-xs">
          {hostError ? (
            <div className="text-destructive-foreground max-w-md px-6 text-center whitespace-pre-wrap">
              {hostError}
            </div>
          ) : (
            <>
              <Loader2Icon className="text-primary size-5 animate-spin" />
              <span className="text-muted-foreground">
                {compile.type === "booting" ? compile.message : "Starting…"}
              </span>
            </>
          )}
        </div>
      ) : null}
      {compile.type === "error" && !booting ? (
        <div className="absolute inset-x-0 top-0 border-b border-red-900/50 bg-[#2a1216]/95 px-3 py-2 font-mono text-[11px] text-red-200">
          <div className="line-clamp-3 whitespace-pre-wrap">
            {compile.message.split("\n").find((line) => line.trim() !== "") ??
              "Compilation failed"}
          </div>
          <div className="mt-1 text-[10px] text-red-200/60">
            The preview keeps showing the last successful build. See the
            Problems panel for details.
          </div>
        </div>
      ) : null}
    </div>
  );
};
