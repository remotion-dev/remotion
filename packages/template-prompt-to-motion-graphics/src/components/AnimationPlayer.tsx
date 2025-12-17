"use client";

import React from "react";
import { Player, type ErrorFallback } from "@remotion/player";
import { RenderControls } from "./RenderControls";
import { SettingsModal } from "./SettingsModal";

const renderErrorFallback: ErrorFallback = ({ error }) => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-background-error p-10">
      <div className="text-center max-w-[80%]">
        <div className="text-destructive text-3xl font-bold mb-4 font-sans">
          Runtime Error
        </div>
        <div className="text-destructive-foreground text-xl font-mono whitespace-pre-wrap break-words">
          {error.message || "An error occurred while rendering"}
        </div>
      </div>
    </div>
  );
};

interface AnimationPlayerProps {
  Component: React.ComponentType | null;
  durationInFrames: number;
  fps: number;
  onDurationChange: (duration: number) => void;
  onFpsChange: (fps: number) => void;
  isCompiling: boolean;
  isStreaming: boolean;
  error: string | null;
  errorType?: "compilation" | "api";
  code: string;
}

export const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
  Component,
  durationInFrames,
  fps,
  onDurationChange,
  onFpsChange,
  isCompiling,
  isStreaming,
  error,
  errorType = "compilation",
  code,
}) => {
  if (isStreaming) {
    return (
      <div className="flex flex-col bg-background min-w-0 h-full">
        <div className="w-full h-full flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground shrink-0">
            Video Preview
          </h2>
          <div className="w-full aspect-video max-h-[calc(100%-80px)] flex flex-col justify-center items-center gap-4 bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">
              Waiting for code generation to finish...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isCompiling) {
    return (
      <div className="flex flex-col bg-background min-w-0 h-full">
        <div className="w-full h-full flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground shrink-0">
            Video Preview
          </h2>
          <div className="w-full aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorTitle = errorType === "api" ? "API Error" : "Compilation Error";
    return (
      <div className="flex flex-col bg-background min-w-0 h-full">
        <div className="w-full h-full flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground shrink-0">
            Video Preview
          </h2>
          <div className="w-full aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-error rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-destructive">
            <div className="text-center max-w-[80%]">
              <div className="text-destructive text-base font-semibold mb-2 font-sans">
                {errorTitle}
              </div>
              <div className="text-destructive-foreground text-sm font-mono whitespace-pre-wrap break-words">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex flex-col bg-background min-w-0 h-full">
        <div className="w-full h-full flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground shrink-0">
            Video Preview
          </h2>
          <div className="w-full aspect-video max-h-[calc(100%-80px)] flex justify-center items-center bg-background-elevated rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] text-muted-foreground-dim text-lg font-sans">
            Select an example to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background min-w-0 h-full">
      <div className="w-full flex flex-col gap-3 h-full">
        <h2 className="text-sm font-medium text-muted-foreground shrink-0">
          Video Preview
        </h2>
        <div className="w-full aspect-video max-h-[calc(100%-80px)] rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <Player
            key={Component.toString()}
            component={Component}
            durationInFrames={durationInFrames}
            fps={fps}
            compositionHeight={1080}
            compositionWidth={1920}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
            controls
            autoPlay
            loop
            errorFallback={renderErrorFallback}
            spaceKeyToPlayOrPause={false}
            clickToPlay={false}
          />
        </div>
        <div className="flex items-center justify-between gap-6">
          <RenderControls code={code} durationInFrames={durationInFrames} fps={fps} />
          <SettingsModal
            durationInFrames={durationInFrames}
            onDurationChange={onDurationChange}
            fps={fps}
            onFpsChange={onFpsChange}
          />
        </div>
      </div>
    </div>
  );
};
