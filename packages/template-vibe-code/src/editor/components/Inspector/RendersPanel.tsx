"use client";

import { DownloadIcon, XIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes, formatDuration } from "../../model/values";
import { useEditor } from "../../state/editor-context";

export const RendersPanel: React.FC = () => {
  const { state, actions } = useEditor();

  if (state.renders.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col gap-2 p-3 text-xs">
        <p>No renders yet.</p>
        <p className="text-muted-foreground-dim text-[11px] leading-relaxed">
          Renders happen entirely in your browser using{" "}
          <code className="font-mono">@remotion/web-renderer</code>. Press{" "}
          <kbd className="font-mono">R</kbd> or use the Render button to start
          one.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2 p-3">
      {state.renders.map((job) => (
        <li
          key={job.id}
          className="border-border bg-background-elevated flex flex-col gap-2 rounded-md border p-2.5 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate font-mono">
              {job.fileName}
            </span>
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
                job.status === "done" && "bg-success/15 text-success",
                job.status === "rendering" && "bg-primary/15 text-primary",
                job.status === "error" &&
                  "bg-destructive/15 text-destructive-foreground",
                job.status === "cancelled" && "bg-muted text-muted-foreground",
              )}
            >
              {job.status}
            </span>
            <button
              type="button"
              aria-label={
                job.status === "rendering" ? "Cancel render" : "Remove"
              }
              className="text-muted-foreground hover:text-foreground"
              onClick={() =>
                job.status === "rendering"
                  ? actions.cancelRender(job.id)
                  : actions.removeRender(job.id)
              }
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
          {job.status === "rendering" ? (
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-[width]"
                style={{ width: `${Math.round(job.progress * 100)}%` }}
              />
            </div>
          ) : null}
          <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
            {job.status === "rendering" ? (
              <span>{Math.round(job.progress * 100)}%</span>
            ) : null}
            {job.sizeInBytes !== null ? (
              <span>{formatBytes(job.sizeInBytes)}</span>
            ) : null}
            {job.finishedAt ? (
              <span>{formatDuration(job.finishedAt - job.startedAt)}</span>
            ) : null}
            {job.error ? (
              <span
                className="text-destructive-foreground truncate"
                title={job.error}
              >
                {job.error}
              </span>
            ) : null}
            <span className="flex-1" />
            {job.url ? (
              <Button size="xs" asChild>
                <a href={job.url} download={job.fileName}>
                  <DownloadIcon /> Download
                </a>
              </Button>
            ) : null}
          </div>
          {job.url && job.kind === "still" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.url}
              alt={job.fileName}
              className="border-border max-h-40 rounded border object-contain"
            />
          ) : null}
          {job.url && job.kind === "media" ? (
            <video
              src={job.url}
              controls
              className="border-border max-h-40 rounded border bg-black"
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};
