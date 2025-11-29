"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

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
  isStreaming?: boolean;
}

const headerText = `// Available Remotion imports:
// Remotion.AbsoluteFill, Remotion.interpolate,
// Remotion.useCurrentFrame, Remotion.useVideoConfig,
// Remotion.spring, Remotion.Sequence`;

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  isStreaming = false,
}) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isStreamingRef = useRef(isStreaming);

  // Keep ref in sync with prop and clear markers during streaming
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Switch language based on streaming state
  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (model && monacoRef.current) {
      const language = isStreaming ? "plaintext" : "javascript";
      monacoRef.current.editor.setModelLanguage(model, language);
    }
  }, [isStreaming]);

  // Continuously clear markers while streaming
  useEffect(() => {
    if (!isStreaming || !monacoRef.current) return;

    const clearAllMarkers = () => {
      monacoRef.current?.editor.getModels().forEach((model) => {
        // Clear markers from all known owners
        monacoRef.current?.editor.setModelMarkers(model, "javascript", []);
        monacoRef.current?.editor.setModelMarkers(model, "typescript", []);
        monacoRef.current?.editor.setModelMarkers(model, "owner", []);
      });
    };

    // Clear immediately and on interval while streaming
    clearAllMarkers();
    const interval = setInterval(clearAllMarkers, 100);

    return () => clearInterval(interval);
  }, [isStreaming, code]);

  const handleEditorMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editorInstance;

    // Override marker setting to suppress during streaming
    const originalSetModelMarkers = monaco.editor.setModelMarkers;
    monaco.editor.setModelMarkers = (model, owner, markers) => {
      // Check the ref (not the prop) to get current value
      if (isStreamingRef.current) {
        return;
      }
      originalSetModelMarkers.call(monaco.editor, model, owner, markers);
    };
  };

  return (
    <div className="w-[600px] h-full flex flex-col bg-[#1e1e1e] border-l border-[#2a2a2a]">
      <div className="p-3 px-4 bg-[#252526] border-b border-[#2a2a2a] font-mono text-xs text-[#6a9955] leading-relaxed whitespace-pre">
        {headerText}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {isStreaming && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-3 bg-[#1e1e1e] px-4 py-3 rounded-lg border border-[#333]">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm font-sans">
                Generating code...
              </span>
            </div>
          </div>
        )}
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorMount}
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
