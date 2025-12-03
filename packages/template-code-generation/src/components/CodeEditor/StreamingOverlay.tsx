"use client";

import React from "react";

interface StreamingOverlayProps {
  visible: boolean;
  message?: string;
}

export const StreamingOverlay: React.FC<StreamingOverlayProps> = ({
  visible,
  message = "Generating code...",
}) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
      <div className="flex items-center gap-3 bg-[#1e1e1e] px-4 py-3 rounded-lg border border-[#333]">
        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-white text-sm font-sans">{message}</span>
      </div>
    </div>
  );
};
