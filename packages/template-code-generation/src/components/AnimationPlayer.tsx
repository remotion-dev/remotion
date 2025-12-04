"use client";

import React from "react";
import { Player, type ErrorFallback } from "@remotion/player";

const renderErrorFallback: ErrorFallback = ({ error }) => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-[#2a1a1a] p-10">
      <div className="text-center max-w-[80%]">
        <div className="text-[#dc2626] text-3xl font-bold mb-4 font-sans">
          Runtime Error
        </div>
        <div className="text-[#f87171] text-xl font-mono whitespace-pre-wrap break-words">
          {error.message || "An error occurred while rendering"}
        </div>
      </div>
    </div>
  );
};

interface AnimationPlayerProps {
  Component: React.FC | null;
  durationInFrames: number;
  fps: number;
  isCompiling: boolean;
  error: string | null;
}

export const AnimationPlayer: React.FC<AnimationPlayerProps> = ({
  Component,
  durationInFrames,
  fps,
  isCompiling,
  error,
}) => {
  if (isCompiling) {
    return (
      <div className="flex flex-3 flex-col items-center bg-[#0a0a0a] min-w-0">
        <div className="w-full max-w-[1200px]">
          <h2 className="text-sm font-medium text-[#888] mb-3">Video Preview</h2>
          <div className="w-full aspect-video flex justify-center items-center bg-[#1a1a1a] rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 border-4 border-[#333] border-t-[#6366f1] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-3 flex-col items-center bg-[#0a0a0a] min-w-0">
        <div className="w-full max-w-[1200px]">
          <h2 className="text-sm font-medium text-[#888] mb-3">Video Preview</h2>
          <div className="w-full aspect-video flex justify-center items-center bg-[#2a1a1a] rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-[#dc2626]">
            <div className="text-center max-w-[80%]">
              <div className="text-[#dc2626] text-base font-semibold mb-2 font-sans">
                Compilation Error
              </div>
              <div className="text-[#f87171] text-sm font-mono whitespace-pre-wrap break-words">
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
      <div className="flex flex-3 flex-col items-center bg-[#0a0a0a] min-w-0">
        <div className="w-full max-w-[1200px]">
          <h2 className="text-sm font-medium text-[#888] mb-3">Video Preview</h2>
          <div className="w-full aspect-video flex justify-center items-center bg-[#1a1a1a] rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] text-[#666] text-lg font-sans">
            Select an example to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-3 flex-col items-center bg-[#0a0a0a] min-w-0">
      <div className="w-full max-w-[1200px]">
        <h2 className="text-sm font-medium text-[#888] mb-3">Video Preview</h2>
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
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
              backgroundColor: "white",
            }}
            controls
            autoPlay
            loop
            errorFallback={renderErrorFallback}
            spaceKeyToPlayOrPause={false}
            clickToPlay={false}
          />
        </div>
      </div>
    </div>
  );
};
