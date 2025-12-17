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

// Monaco must be loaded client-side only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-[600px] h-full flex justify-center items-center bg-background-editor">
      <span className="text-muted-foreground font-sans">Loading editor...</span>
    </div>
  ),
});

type StreamPhase = "idle" | "reasoning" | "generating";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  isStreaming?: boolean;
  streamPhase?: StreamPhase;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  isStreaming = false,
  streamPhase = "idle",
}) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isStreamingRef = useRef(isStreaming);

  // Keep ref in sync with prop and clear markers during streaming
  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Use typescript for semantic checking, plaintext during streaming
  const editorLanguage = isStreaming ? "plaintext" : "typescript";

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

  const handleEditorMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editorInstance;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ts = (monaco.languages as any).typescript;

    // Configure TypeScript compiler options for JSX support
    ts?.typescriptDefaults?.setCompilerOptions({
      target: ts.ScriptTarget?.ESNext,
      module: ts.ModuleKind?.ESNext,
      jsx: ts.JsxEmit?.Preserve,
      allowNonTsExtensions: true,
      strict: false,
      noEmit: true,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind?.NodeJs,
      skipLibCheck: true,
    });

    // Enable semantic validation for import checking
    ts?.typescriptDefaults?.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add React types so TS understands JSX
    ts?.typescriptDefaults?.addExtraLib(
      `
      declare namespace React {
        type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactNode[];
        interface ReactElement<P = any> { type: any; props: P; key: string | null; }
        type FC<P = {}> = (props: P) => ReactElement | null;
        type CSSProperties = { [key: string]: string | number | undefined };
        interface HTMLAttributes<T> {
          className?: string;
          style?: CSSProperties;
          children?: ReactNode;
          [key: string]: any;
        }
        interface SVGAttributes<T> {
          className?: string;
          style?: CSSProperties;
          children?: ReactNode;
          [key: string]: any;
        }
        function createElement(type: any, props?: any, ...children: any[]): ReactElement;
        function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
        function useEffect(effect: () => void | (() => void), deps?: any[]): void;
        function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
        function useMemo<T>(factory: () => T, deps: any[]): T;
        function useRef<T>(initial: T): { current: T };
      }
      declare const React: typeof React;
      declare namespace JSX {
        interface Element extends React.ReactElement<any, any> {}
        interface IntrinsicElements {
          div: React.HTMLAttributes<HTMLDivElement>;
          span: React.HTMLAttributes<HTMLSpanElement>;
          p: React.HTMLAttributes<HTMLParagraphElement>;
          h1: React.HTMLAttributes<HTMLHeadingElement>;
          h2: React.HTMLAttributes<HTMLHeadingElement>;
          h3: React.HTMLAttributes<HTMLHeadingElement>;
          img: React.HTMLAttributes<HTMLImageElement> & { src?: string; alt?: string };
          svg: React.SVGAttributes<SVGSVGElement>;
          path: React.SVGAttributes<SVGPathElement> & { d?: string };
          circle: React.SVGAttributes<SVGCircleElement> & { cx?: number; cy?: number; r?: number };
          rect: React.SVGAttributes<SVGRectElement> & { x?: number; y?: number; width?: number; height?: number };
          polygon: React.SVGAttributes<SVGPolygonElement> & { points?: string };
          line: React.SVGAttributes<SVGLineElement> & { x1?: number; y1?: number; x2?: number; y2?: number };
          text: React.SVGAttributes<SVGTextElement> & { x?: number; y?: number };
          g: React.SVGAttributes<SVGGElement>;
          defs: React.SVGAttributes<SVGDefsElement>;
          filter: React.SVGAttributes<SVGFilterElement> & { id?: string };
          feGaussianBlur: React.SVGAttributes<SVGFEGaussianBlurElement> & { stdDeviation?: number | string; result?: string };
          feMerge: React.SVGAttributes<SVGFEMergeElement>;
          feMergeNode: React.SVGAttributes<SVGFEMergeNodeElement> & { in?: string };
          mesh: any;
          group: any;
          ambientLight: any;
          pointLight: any;
          sphereGeometry: any;
          meshStandardMaterial: any;
          planeGeometry: any;
          [elemName: string]: any;
        }
      }
      `,
      "react.d.ts",
    );

    // Add module declaration for 'react' to allow imports
    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'react' {
        export const useState: typeof React.useState;
        export const useEffect: typeof React.useEffect;
        export const useCallback: typeof React.useCallback;
        export const useMemo: typeof React.useMemo;
        export const useRef: typeof React.useRef;
        export default React;
      }`,
      "react-module.d.ts",
    );

    // Add type declarations for all whitelisted libraries
    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'remotion' {
        export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement>>;
        export function useCurrentFrame(): number;
        export function useVideoConfig(): { fps: number; durationInFrames: number; width: number; height: number };
        export function interpolate(input: number, inputRange: number[], outputRange: number[], options?: any): number;
        export function spring(options: { frame: number; fps: number; config?: any; durationInFrames?: number }): number;
        export const Sequence: React.FC<{ from?: number; durationInFrames?: number; children: React.ReactNode }>;
      }`,
      "remotion.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module '@remotion/shapes' {
        interface ShapeProps {
          fill?: string;
          stroke?: string;
          strokeWidth?: number;
          style?: React.CSSProperties;
        }
        export const Rect: React.FC<ShapeProps & { width: number; height: number; cornerRadius?: number }>;
        export const Circle: React.FC<ShapeProps & { radius: number }>;
        export const Triangle: React.FC<ShapeProps & { length: number; direction?: 'up' | 'down' | 'left' | 'right' }>;
        export const Star: React.FC<ShapeProps & { innerRadius: number; outerRadius: number; points?: number }>;
        export const Polygon: React.FC<ShapeProps & { radius: number; points: number }>;
        export const Ellipse: React.FC<ShapeProps & { rx: number; ry: number }>;
      }`,
      "remotion-shapes.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module '@remotion/lottie' {
        export const Lottie: React.FC<{ animationData?: any; src?: string; playbackRate?: number; style?: React.CSSProperties }>;
      }`,
      "remotion-lottie.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module '@remotion/three' {
        export const ThreeCanvas: React.FC<{
          children?: any;
          style?: React.CSSProperties;
          width?: number;
          height?: number;
          camera?: { position?: number[]; fov?: number; near?: number; far?: number; [key: string]: any };
          orthographic?: boolean;
          [key: string]: any;
        }>;
      }`,
      "remotion-three.d.ts",
    );

    ts?.typescriptDefaults?.addExtraLib(
      `declare module 'three' {
        export class Vector3 { constructor(x?: number, y?: number, z?: number); x: number; y: number; z: number; }
        export class Color { constructor(color?: string | number); }
        export class MeshStandardMaterial { constructor(params?: any); }
        export class BoxGeometry { constructor(width?: number, height?: number, depth?: number); }
        export class SphereGeometry { constructor(radius?: number, widthSegments?: number, heightSegments?: number); }
        export class Mesh { constructor(geometry?: any, material?: any); position: Vector3; rotation: Vector3; }
        export const DoubleSide: number;
      }`,
      "three.d.ts",
    );

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

  // Simple pass-through: code is displayed and edited as-is
  const handleChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <div className="flex-2 h-[500px] lg:h-full flex flex-col min-w-0">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">
        Remotion Code
      </h2>
      <div className="flex-1 flex flex-col bg-background-editor rounded-lg overflow-hidden">
        <EditorHeader filename="MyAnimation.tsx" code={code} />
        <div className="flex-1 overflow-hidden relative">
          <StreamingOverlay
            visible={isStreaming}
            message={
              streamPhase === "reasoning" ? "Thinking..." : "Generating code..."
            }
          />
          <MonacoEditor
            height="100%"
            language={editorLanguage}
            theme="vs-dark"
            path="MyAnimation.tsx"
            value={code}
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
