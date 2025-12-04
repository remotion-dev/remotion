"use client";

import React from "react";
import { CopyButton } from "./CopyButton";

interface EditorHeaderProps {
  filename: string;
  code: string;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  filename,
  code,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#2a2a2a]">
      <span className="text-xs text-[#888] font-mono">{filename}</span>
      <CopyButton text={code} />
    </div>
  );
};
