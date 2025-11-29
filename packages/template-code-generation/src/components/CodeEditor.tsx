"use client";

import React from "react";
import dynamic from "next/dynamic";

// Monaco must be loaded client-side only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-[600px] h-full flex justify-center items-center bg-[#1e1e1e]">
      <span className="text-[#888] font-sans">Loading editor...</span>
    </div>
  ),
});

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

const headerText = `// Available Remotion imports:
// Remotion.AbsoluteFill, Remotion.interpolate,
// Remotion.useCurrentFrame, Remotion.useVideoConfig,
// Remotion.spring, Remotion.Sequence
//
// Your code should be an arrow function returning JSX:`;

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div className="w-[600px] h-full flex flex-col bg-[#1e1e1e] border-l border-[#2a2a2a]">
      <div className="p-3 px-4 bg-[#252526] border-b border-[#2a2a2a] font-mono text-xs text-[#6a9955] leading-relaxed whitespace-pre">
        {headerText}
      </div>
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};
