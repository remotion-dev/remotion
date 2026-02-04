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
      <div className="w-full aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-error rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-destructive">
        <Alert variant="destructive" className="max-w-[80%] bg-transparent border-none text-center">
          <AlertCircle className={cn(styles.icon, "mx-auto")} />
          {title && <AlertTitle className={styles.title}>{title}</AlertTitle>}
          <AlertDescription className={cn(styles.description, "text-destructive-foreground font-mono whitespace-pre-wrap break-words")}>
            {error}
          </AlertDescription>
          {children}
        </Alert>
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
