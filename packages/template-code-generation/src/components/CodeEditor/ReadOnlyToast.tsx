"use client";

import React from "react";
import { Lock } from "lucide-react";

interface ReadOnlyToastProps {
  visible: boolean;
}

export const ReadOnlyToast: React.FC<ReadOnlyToastProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
      <div className="flex items-center gap-2 bg-amber-900/90 text-amber-100 px-4 py-2 rounded-lg border border-amber-700 shadow-lg">
        <Lock className="w-4 h-4" />
        <span className="text-sm font-sans">These lines are read-only</span>
      </div>
    </div>
  );
};
