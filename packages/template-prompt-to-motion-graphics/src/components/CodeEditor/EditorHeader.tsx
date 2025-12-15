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
    <div className="flex items-center justify-between px-4 py-2 bg-background-editor-header border-b border-accent">
      <span className="text-xs text-muted-foreground font-mono">{filename}</span>
      <CopyButton text={code} />
    </div>
  );
};
