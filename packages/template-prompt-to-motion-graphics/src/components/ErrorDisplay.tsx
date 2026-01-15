"use client";

import React from "react";

export type ErrorType = "compilation" | "api" | "validation";

interface ErrorDisplayProps {
  error: string;
  errorType: ErrorType;
}

const errorTitles: Record<ErrorType, string> = {
  validation: "Invalid Prompt",
  api: "API Error",
  compilation: "Compilation Error",
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorType,
}) => {
  return (
    <div className="w-full aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-error rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-destructive">
      <div className="text-center max-w-[80%]">
        <div className="text-destructive text-base font-semibold mb-2 font-sans">
          {errorTitles[errorType]}
        </div>
        <div className="text-destructive-foreground text-sm font-mono whitespace-pre-wrap break-words">
          {error}
        </div>
      </div>
    </div>
  );
};
