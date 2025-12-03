"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";

import { EditorHeader } from "./EditorHeader";
import { StreamingOverlay } from "./StreamingOverlay";
import { ReadOnlyToast } from "./ReadOnlyToast";
import { EDITOR_STYLES } from "./styles";

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

const WRAPPER_PREFIX = `import * as Remotion from 'remotion';

export const MyAnimation = () => {
`;

const WRAPPER_SUFFIX = `
};`;

// Calculate line counts for wrapper boundaries
const PREFIX_LINE_COUNT = WRAPPER_PREFIX.split("\n").length - 1;
const SUFFIX_LINE_COUNT = WRAPPER_SUFFIX.split("\n").length - 1;

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  isStreaming = false,
}) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isStreamingRef = useRef(isStreaming);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(
    null,
  );
  const [showReadOnlyToast, setShowReadOnlyToast] = React.useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        monacoRef.current?.editor.setModelMarkers(model, "javascript", []);
        monacoRef.current?.editor.setModelMarkers(model, "typescript", []);
        monacoRef.current?.editor.setModelMarkers(model, "owner", []);
      });
    };

    clearAllMarkers();
    const interval = setInterval(clearAllMarkers, 100);

    return () => clearInterval(interval);
  }, [isStreaming, code]);

  // Apply read-only decorations to prefix and suffix lines
  const applyReadOnlyDecorations = (totalLines: number) => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations: editor.IModelDeltaDecoration[] = [];

    // Prefix lines (lines 1 to PREFIX_LINE_COUNT)
    for (let i = 1; i <= PREFIX_LINE_COUNT; i++) {
      decorations.push({
        range: new monacoRef.current.Range(i, 1, i, 1),
        options: {
          isWholeLine: true,
          className: "readonly-line",
        },
      });
    }

    // Suffix lines (last SUFFIX_LINE_COUNT lines)
    const suffixStart = totalLines - SUFFIX_LINE_COUNT + 1;
    for (let i = suffixStart; i <= totalLines; i++) {
      decorations.push({
        range: new monacoRef.current.Range(i, 1, i, 1),
        options: {
          isWholeLine: true,
          className: "readonly-line",
        },
      });
    }

    // Use the modern createDecorationsCollection API
    if (decorationsRef.current) {
      decorationsRef.current.set(decorations);
    } else {
      decorationsRef.current =
        editorRef.current.createDecorationsCollection(decorations);
    }
  };

  const handleEditorMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editorInstance;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ts = (monaco.languages as any).typescript;

    // Apply initial decorations
    const totalLines = (WRAPPER_PREFIX + code + WRAPPER_SUFFIX).split(
      "\n",
    ).length;
    applyReadOnlyDecorations(totalLines);

    // Configure TypeScript compiler options
    ts?.typescriptDefaults?.setCompilerOptions({
      target: ts.ScriptTarget?.ESNext,
      module: ts.ModuleKind?.ESNext,
      jsx: ts.JsxEmit?.React,
      jsxFactory: "React.createElement",
      allowNonTsExtensions: true,
      strict: false,
      noEmit: true,
      esModuleInterop: true,
    });

    // Add React types so TS understands JSX
    ts?.typescriptDefaults?.addExtraLib(
      `
      declare namespace React {
        type ReactNode = string | number | boolean | null | undefined | React.ReactElement | React.ReactNode[];
        interface ReactElement<P = any> { type: any; props: P; key: string | null; }
        type FC<P = {}> = (props: P) => ReactElement | null;
        type CSSProperties = Record<string, string | number>;
        interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
          className?: string;
          style?: CSSProperties;
          [key: string]: any;
        }
        interface AriaAttributes { [key: string]: any; }
        interface DOMAttributes<T> { children?: ReactNode; [key: string]: any; }
        function createElement(type: any, props?: any, ...children: any[]): ReactElement;
      }
      declare const React: typeof React;
      `,
      "react.d.ts",
    );

    // Add type declaration for remotion module
    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'remotion' {
        export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement>>;
        export function useCurrentFrame(): number;
        export function useVideoConfig(): { fps: number; durationInFrames: number; width: number; height: number };
        export function interpolate(input: number, inputRange: number[], outputRange: number[], options?: any): number;
        export function spring(options: { frame: number; fps: number; config?: any }): number;
        export const Sequence: React.FC<{ from?: number; durationInFrames?: number; children: React.ReactNode }>;
      }`,
      "remotion.d.ts",
    );

    // Block editing in protected lines by intercepting model changes
    const model = editorInstance.getModel();
    if (model) {
      let lastValidContent = model.getValue();

      model.onDidChangeContent(() => {
        const currentContent = model.getValue();
        const hasValidPrefix = currentContent.startsWith(WRAPPER_PREFIX);
        const hasValidSuffix = currentContent.endsWith(WRAPPER_SUFFIX);

        if (!hasValidPrefix || !hasValidSuffix) {
          model.setValue(lastValidContent);

          if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
          }
          setShowReadOnlyToast(true);
          toastTimeoutRef.current = setTimeout(() => {
            setShowReadOnlyToast(false);
          }, 2000);
        } else {
          lastValidContent = currentContent;
        }
      });
    }

    // Override marker setting to suppress during streaming
    const originalSetModelMarkers = monaco.editor.setModelMarkers;
    monaco.editor.setModelMarkers = (mdl, owner, markers) => {
      if (isStreamingRef.current) {
        return;
      }
      originalSetModelMarkers.call(monaco.editor, mdl, owner, markers);
    };

    // Set up JSX syntax highlighting
    const monacoJsxSyntaxHighlight = new MonacoJsxSyntaxHighlight(
      getWorker(),
      monaco,
    );
    const { highlighter } = monacoJsxSyntaxHighlight.highlighterBuilder({
      editor: editorInstance,
    });
    highlighter();
    editorInstance.onDidChangeModelContent(() => {
      highlighter();
    });
  };

  // Wrap the body code with prefix/suffix for display
  const displayCode = WRAPPER_PREFIX + code + WRAPPER_SUFFIX;

  // Extract body from full code when user edits, restore wrapper if modified
  const handleChange = (value: string | undefined) => {
    if (!value) {
      onChange("");
      return;
    }

    const hasValidPrefix = value.startsWith(WRAPPER_PREFIX);
    const hasValidSuffix = value.endsWith(WRAPPER_SUFFIX);

    // If wrapper was modified, restore it
    if (!hasValidPrefix || !hasValidSuffix) {
      let body = value;
      if (hasValidPrefix) {
        body = body.slice(WRAPPER_PREFIX.length);
      }
      if (hasValidSuffix) {
        body = body.slice(0, -WRAPPER_SUFFIX.length);
      }

      const restoredCode = WRAPPER_PREFIX + body + WRAPPER_SUFFIX;
      editorRef.current?.setValue(restoredCode);

      const totalLines = restoredCode.split("\n").length;
      applyReadOnlyDecorations(totalLines);

      onChange(body);
      return;
    }

    // Normal case: wrapper intact, extract body
    const body = value.slice(WRAPPER_PREFIX.length, -WRAPPER_SUFFIX.length);

    const totalLines = value.split("\n").length;
    applyReadOnlyDecorations(totalLines);

    onChange(body);
  };

  return (
    <div className="flex-2 h-full flex flex-col">
      <h2 className="text-sm font-medium text-[#888] mb-3">Remotion Code</h2>
      <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-lg overflow-hidden">
        <EditorHeader filename="MyAnimation.tsx" code={displayCode} />
      <style>{EDITOR_STYLES}</style>
      <div className="flex-1 overflow-hidden relative">
        <StreamingOverlay visible={isStreaming} />
        <ReadOnlyToast visible={showReadOnlyToast} />
        <MonacoEditor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={displayCode}
          onChange={handleChange}
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
            glyphMargin: false,
            lineNumbersMinChars: 3,
            folding: false,
          }}
        />
      </div>
      </div>
    </div>
  );
};
