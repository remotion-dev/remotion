"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
      <Alert variant="destructive" className="max-w-[80%] bg-transparent border-none text-center">
        <AlertCircle className="h-5 w-5 mx-auto" />
        <AlertTitle className="text-base font-semibold">
          {errorTitles[errorType]}
        </AlertTitle>
        <AlertDescription className="text-destructive-foreground font-mono whitespace-pre-wrap break-words">
          {error}
        </AlertDescription>
      </Alert>
    </div>
  );
};
