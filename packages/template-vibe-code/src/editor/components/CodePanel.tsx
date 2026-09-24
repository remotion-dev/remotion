"use client";

import type { Monaco } from "@monaco-editor/react";
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XIcon,
} from "lucide-react";
import type { editor } from "monaco-editor";
import {
  MonacoJsxSyntaxHighlight,
  getWorker,
} from "monaco-jsx-syntax-highlight";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getFileName, getMonacoLanguage } from "../model/project";
import { useEditor } from "../state/editor-context";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
      Loading editor…
    </div>
  ),
});

const locationPattern =
  /((?:src\/)?[\w./-]+\.(?:tsx|ts|jsx|js)):(\d+)(?::(\d+))?/;

type Problem = {
  kind: "error" | "warning" | "runtime";
  message: string;
  location: { filePath: string; line: number; column: number } | null;
};

const useProblems = (): Problem[] => {
  const { state } = useEditor();
  return useMemo(() => {
    const problems: Problem[] = [];
    const toProblem = (kind: Problem["kind"], message: string): Problem => {
      const match = message.match(locationPattern);
      const filePath = match
        ? Object.keys(state.files).find(
            (file) =>
              file === match[1] ||
              file.endsWith(`/${match[1]}`) ||
              match[1].endsWith(file),
          )
        : undefined;
      return {
        kind,
        message,
        location:
          match && filePath
            ? {
                filePath,
                line: Number(match[2]),
                column: Number(match[3] ?? 1),
              }
            : null,
      };
    };

    if (state.compile.type === "error") {
      problems.push(toProblem("error", state.compile.message));
    }

    if (state.runtimeError) {
      problems.push(toProblem("runtime", state.runtimeError));
    }

    for (const warning of state.warnings) {
      problems.push(toProblem("warning", warning));
    }

    return problems;
  }, [state.compile, state.files, state.runtimeError, state.warnings]);
};

export const CodePanel: React.FC = () => {
  const { state, actions } = useEditor();
  const { activeFile, openFiles, files, savedFiles, revealRequest } = state;
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const saveRef = useRef(actions.save);
  saveRef.current = actions.save;
  const problems = useProblems();
  const [problemsOpen, setProblemsOpen] = useState(true);

  useEffect(() => {
    const instance = editorRef.current;
    if (!revealRequest || !instance || activeFile !== revealRequest.filePath) {
      return;
    }

    const timeout = window.setTimeout(() => {
      instance.revealLineInCenter(revealRequest.line);
      instance.setPosition({
        lineNumber: revealRequest.line,
        column: revealRequest.column,
      });
      instance.focus();
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [activeFile, revealRequest]);

  // Show compiler diagnostics inline.
  useEffect(() => {
    const monaco = monacoRef.current;
    const instance = editorRef.current;
    const model = instance?.getModel();
    if (!monaco || !model || !activeFile) {
      return;
    }

    monaco.editor.setModelMarkers(
      model,
      "remotion",
      problems
        .filter(
          (problem) =>
            problem.kind !== "runtime" &&
            problem.location?.filePath === activeFile,
        )
        .map((problem) => ({
          severity:
            problem.kind === "error"
              ? monaco.MarkerSeverity.Error
              : monaco.MarkerSeverity.Warning,
          message: problem.message.split("\n").slice(0, 6).join("\n"),
          startLineNumber: problem.location!.line,
          startColumn: problem.location!.column,
          endLineNumber: problem.location!.line,
          endColumn: model.getLineMaxColumn(problem.location!.line),
        })),
    );
  }, [activeFile, problems, files]);

  const handleMount = (
    instance: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = instance;

    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      allowNonTsExtensions: true,
      allowJs: true,
      noEmit: true,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      skipLibCheck: true,
    });
    // The real compiler reports type errors; Monaco has no Remotion types.
    ts.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      void saveRef.current();
    });

    const jsxHighlight = new MonacoJsxSyntaxHighlight(getWorker(), monaco);
    const { highlighter } = jsxHighlight.highlighterBuilder({
      editor: instance,
    });
    highlighter();
    instance.onDidChangeModelContent(() => highlighter());
    instance.onDidChangeModel(() => highlighter());
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="tablist"
        aria-label="Open files"
        className="border-border bg-background-panel flex h-9 shrink-0 items-end overflow-x-auto border-b"
      >
        {openFiles.map((filePath) => {
          const active = filePath === activeFile;
          const dirty = files[filePath] !== savedFiles[filePath];
          return (
            <div
              key={filePath}
              role="tab"
              aria-selected={active}
              className={cn(
                "group flex h-8 shrink-0 cursor-default items-center gap-1.5 border-r px-3 text-xs",
                active
                  ? "bg-background-editor text-foreground border-b-primary -mb-px border-b-2"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => actions.openFile(filePath)}
              onAuxClick={(event) => {
                if (event.button === 1) {
                  actions.closeFile(filePath);
                }
              }}
            >
              <span className="font-mono">{getFileName(filePath)}</span>
              <button
                type="button"
                aria-label={`Close ${getFileName(filePath)}`}
                className={cn(
                  "hover:bg-accent flex size-4 items-center justify-center rounded-sm",
                  dirty ? "text-warning" : "opacity-0 group-hover:opacity-100",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  actions.closeFile(filePath);
                }}
              >
                {dirty ? (
                  <span className="bg-warning group-hover:hidden size-1.5 rounded-full" />
                ) : null}
                <XIcon
                  className={cn("size-3", dirty && "hidden group-hover:block")}
                />
              </button>
            </div>
          );
        })}
      </div>
      <div className="relative min-h-0 flex-1">
        {activeFile ? (
          <MonacoEditor
            key="editor"
            height="100%"
            path={activeFile}
            language={getMonacoLanguage(activeFile)}
            value={files[activeFile] ?? ""}
            theme="vibe-dark"
            beforeMount={(monaco) => {
              monaco.editor.defineTheme("vibe-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                  "editor.background": "#0d1017",
                  "editorGutter.background": "#0d1017",
                  "editorLineNumber.foreground": "#3b4354",
                  "editorLineNumber.activeForeground": "#8b93a7",
                  "editor.lineHighlightBorder": "#161a23",
                },
              });
            }}
            onMount={handleMount}
            onChange={(value) => {
              if (typeof value === "string") {
                actions.editFile(activeFile, value);
              }
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 12.5,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "off",
              padding: { top: 12 },
              glyphMargin: false,
              lineNumbersMinChars: 3,
              folding: true,
              renderLineHighlight: "line",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontLigatures: true,
              bracketPairColorization: { enabled: true },
              stickyScroll: { enabled: false },
            }}
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Open a file from the sidebar to start editing.
          </div>
        )}
      </div>
      {problems.length > 0 ? (
        <div
          className={cn(
            "border-border flex shrink-0 flex-col border-t",
            problemsOpen ? "max-h-[35%]" : "",
          )}
        >
          <button
            type="button"
            className="bg-background-panel hover:bg-accent/40 flex h-7 shrink-0 items-center gap-2 px-3 text-left text-[11px] font-medium"
            onClick={() => setProblemsOpen((open) => !open)}
            aria-expanded={problemsOpen}
          >
            <AlertTriangleIcon
              className={cn(
                "size-3.5",
                problems.some((problem) => problem.kind !== "warning")
                  ? "text-destructive-foreground"
                  : "text-warning",
              )}
            />
            Problems
            <span className="text-muted-foreground">({problems.length})</span>
            <span className="flex-1" />
            {problemsOpen ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronUpIcon className="size-3.5" />
            )}
          </button>
          {problemsOpen ? (
            <div className="bg-background-panel min-h-0 overflow-auto">
              {problems.map((problem, index) => (
                <div
                  key={`${index}-${problem.message.slice(0, 40)}`}
                  className="border-border-dim flex items-start gap-2 border-t px-3 py-2 text-[11px]"
                >
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded px-1 py-px text-[9px] font-semibold tracking-wide uppercase",
                      problem.kind === "warning"
                        ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive-foreground",
                    )}
                  >
                    {problem.kind}
                  </span>
                  <pre className="min-w-0 flex-1 font-mono whitespace-pre-wrap break-words">
                    {problem.message}
                  </pre>
                  {problem.location ? (
                    <button
                      type="button"
                      className="text-primary shrink-0 font-mono hover:underline"
                      onClick={() =>
                        actions.reveal(
                          problem.location!.filePath,
                          problem.location!.line,
                          problem.location!.column - 1,
                        )
                      }
                    >
                      {getFileName(problem.location.filePath)}:
                      {problem.location.line}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
