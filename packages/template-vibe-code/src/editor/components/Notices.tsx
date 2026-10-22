"use client";

import { AlertCircleIcon, InfoIcon, XIcon } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { useEditor } from "../state/editor-context";

export const Notices: React.FC = () => {
  const { state, dispatch } = useEditor();
  if (state.notices.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[360px] flex-col gap-2">
      {state.notices.map((notice) => (
        <div
          key={notice.id}
          role={notice.type === "error" ? "alert" : "status"}
          className={cn(
            "pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2 text-xs shadow-lg",
            notice.type === "error"
              ? "border-destructive/40 bg-[#1f1113] text-destructive-foreground"
              : "border-border bg-background-elevated text-foreground",
          )}
        >
          {notice.type === "error" ? (
            <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
          )}
          <span className="min-w-0 flex-1 break-words whitespace-pre-wrap">
            {notice.message}
          </span>
          <button
            type="button"
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => dispatch({ type: "dismiss-notice", id: notice.id })}
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
