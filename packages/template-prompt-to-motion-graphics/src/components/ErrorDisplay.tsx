"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorVariant = "inline" | "card" | "fullscreen";
export type ErrorSize = "sm" | "md" | "lg";

interface ErrorDisplayProps {
  error: string;
  title?: string;
  variant?: ErrorVariant;
  size?: ErrorSize;
  onDismiss?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const sizeStyles: Record<ErrorSize, { icon: string; title: string; description: string }> = {
  sm: { icon: "h-3 w-3", title: "text-xs", description: "text-xs" },
  md: { icon: "h-4 w-4", title: "text-sm font-semibold", description: "text-sm" },
  lg: { icon: "h-5 w-5", title: "text-base font-semibold", description: "text-base" },
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  variant = "card",
  size = "md",
  onDismiss,
  children,
  className,
}) => {
  const styles = sizeStyles[size];

  if (variant === "fullscreen") {
    return (
      <div className="w-full aspect-video max-h-[calc(100%-80px)] flex flex-col justify-center items-center bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-4 max-w-[80%] p-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          <div className="bg-background-error/50 border border-destructive/30 rounded-lg p-4 max-w-full overflow-auto">
            <pre className="text-sm text-destructive font-mono whitespace-pre-wrap break-words text-center">
              {error}
            </pre>
          </div>
          {children}
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Alert variant="destructive" className={cn("flex items-center justify-between", className)}>
        <AlertDescription className={styles.description}>{error}</AlertDescription>
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            className={cn(
              "text-destructive hover:text-destructive hover:bg-destructive/20",
              size === "sm" ? "h-5 w-5" : "h-6 w-6"
            )}
          >
            <X className={styles.icon} />
          </Button>
        )}
      </Alert>
    );
  }

  // card variant (default)
  return (
    <Alert variant="destructive" className={cn("my-2", className)}>
      <AlertCircle className={styles.icon} />
      {title && <AlertTitle className={styles.title}>{title}</AlertTitle>}
      <AlertDescription className={cn(styles.description, "font-mono whitespace-pre-wrap break-words")}>
        {error}
      </AlertDescription>
      {children}
    </Alert>
  );
};

// ErrorType is still used by AnimationPlayer for its interface
export type ErrorType = "compilation" | "api" | "validation";
