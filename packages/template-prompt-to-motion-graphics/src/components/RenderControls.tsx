"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorComp } from "./Error";
import { useRendering } from "../helpers/use-rendering";

export const RenderControls: React.FC<{
  code: string;
  durationInFrames: number;
  fps: number;
}> = ({ code, durationInFrames, fps }) => {
  const { renderMedia, state, undo } = useRendering({ code, durationInFrames, fps });
  const previousPropsRef = useRef({ code, durationInFrames, fps });

  // Reset rendering state when code, duration, or fps changes
  useEffect(() => {
    const prev = previousPropsRef.current;
    const hasChanged =
      prev.code !== code ||
      prev.durationInFrames !== durationInFrames ||
      prev.fps !== fps;

    if (hasChanged && state.status !== "init") {
      undo();
    }
    previousPropsRef.current = { code, durationInFrames, fps };
  }, [code, durationInFrames, fps, state.status, undo]);

  if (
    state.status === "init" ||
    state.status === "invoking" ||
    state.status === "error"
  ) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          disabled={state.status === "invoking" || !code}
          loading={state.status === "invoking"}
          onClick={renderMedia}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {state.status === "invoking"
            ? "Starting render..."
            : "Render & Download"}
        </Button>
        {state.status === "error" && (
          <ErrorComp message={state.error.message} />
        )}
      </div>
    );
  }

  if (state.status === "rendering") {
    const progress = Math.round(state.progress * 100);

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Rendering...</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (state.status === "done") {
    return (
      <div className="flex gap-2">
        <a href={state.url} className="flex-1">
          <Button className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download ({formatBytes(state.size)})
          </Button>
        </a>
        <Button variant="outline" onClick={undo} className="flex-shrink-0">
          Render again
        </Button>
      </div>
    );
  }

  return null;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
