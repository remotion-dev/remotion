"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorComp } from "./Error";
import { ProgressBar } from "./ProgressBar";
import { useRendering } from "../helpers/use-rendering";

export const RenderControls: React.FC<{
  code: string;
}> = ({ code }) => {
  const { renderMedia, state, undo } = useRendering({ code });
  const previousCodeRef = useRef(code);

  // Reset rendering state when code changes
  useEffect(() => {
    if (previousCodeRef.current !== code && state.status !== "init") {
      undo();
    }
    previousCodeRef.current = code;
  }, [code, state.status, undo]);

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
    return (
      <div className="flex flex-col gap-2">
        <ProgressBar progress={state.progress} />
        <p className="text-sm text-muted-foreground text-center">
          Rendering... {Math.round(state.progress * 100)}%
        </p>
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
