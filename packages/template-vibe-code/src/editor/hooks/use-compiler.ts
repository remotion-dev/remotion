"use client";

import {
  BrowserBundlerError,
  createBrowserBundler,
} from "@remotion/browser-bundler";
import { useCallback, useEffect, useRef } from "react";
import type {
  PreviewCompositionSelection,
  PreviewHost,
} from "@/preview/bridge";
import { toVirtualProject, type ProjectFiles } from "../model/project";
import type { EditorAction } from "../state/editor-store";
import { getErrorMessage } from "./use-preview-host";

type Session = {
  bundler: ReturnType<typeof createBrowserBundler>;
  queue: Promise<void>;
  revision: number;
  hasBundle: boolean;
  appliedSelection: PreviewCompositionSelection | null;
  disposed: boolean;
};

const getCompilationErrorMessage = (error: unknown): string => {
  if (error instanceof BrowserBundlerError) {
    return [error.message, ...error.diagnostics].join("\n\n");
  }

  return getErrorMessage(error);
};

const sameSelection = (
  a: PreviewCompositionSelection | null,
  b: PreviewCompositionSelection | null,
) =>
  a !== null &&
  b !== null &&
  a.compositionId === b.compositionId &&
  JSON.stringify(a.inputProps) === JSON.stringify(b.inputProps);

/**
 * Compiles the project with the browser bundler whenever the files change and
 * pushes the result into the preview iframe using Fast Refresh.
 */
export const useCompiler = ({
  host,
  files,
  entryPoint,
  selection,
  dispatch,
}: {
  host: PreviewHost | null;
  files: ProjectFiles;
  entryPoint: string;
  selection: PreviewCompositionSelection | null;
  dispatch: React.Dispatch<EditorAction>;
}) => {
  const sessionRef = useRef<Session | null>(null);
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  useEffect(() => {
    if (!host) {
      return;
    }

    let bundler: ReturnType<typeof createBrowserBundler>;
    try {
      bundler = createBrowserBundler({
        enableFastRefresh: true,
        // Served from public/compiler, see scripts/build-preview.mjs.
        workerUrl: new URL(
          "/compiler/browser-bundler-worker.js",
          window.location.origin,
        ),
        onProgress: ({ loadedBytes, totalBytes }) => {
          if (sessionRef.current?.hasBundle) {
            return;
          }

          dispatch({
            type: "set-compile",
            compile: {
              type: "booting",
              message: totalBytes
                ? `Loading compiler ${Math.round((loadedBytes / totalBytes) * 100)}%`
                : `Loading compiler (${(loadedBytes / 1024 / 1024).toFixed(1)} MB)`,
            },
          });
        },
      });
    } catch (error) {
      dispatch({
        type: "set-compile",
        compile: { type: "error", message: getErrorMessage(error) },
      });
      return;
    }

    const session: Session = {
      bundler,
      queue: Promise.resolve(),
      revision: 0,
      hasBundle: false,
      appliedSelection: null,
      disposed: false,
    };
    sessionRef.current = session;

    return () => {
      session.disposed = true;
      bundler.dispose();
      sessionRef.current = null;
    };
  }, [dispatch, host]);

  const compile = useCallback(
    (nextFiles: ProjectFiles) => {
      const session = sessionRef.current;
      if (!host || !session || session.disposed) {
        return;
      }

      const revision = ++session.revision;
      if (session.hasBundle) {
        dispatch({ type: "set-compile", compile: { type: "compiling" } });
      }

      session.queue = session.queue.then(async () => {
        if (session.disposed || revision !== session.revision) {
          return;
        }

        try {
          const bundle = await session.bundler.bundle({
            project: toVirtualProject(nextFiles, entryPoint),
          });
          if (session.disposed) {
            return;
          }

          // Errors of the previous build are stale now; errors thrown while
          // mounting the new build must stay visible.
          dispatch({ type: "set-runtime-error", message: null });
          // Newer edits may be queued, but every compiled bundle must be
          // applied because the next Fast Refresh update builds on it.
          await host.applyBundle(bundle);
          session.hasBundle = true;
          const desired = selectionRef.current;
          if (desired && !sameSelection(desired, session.appliedSelection)) {
            session.appliedSelection = desired;
            await host.selectComposition(desired);
          }

          if (session.disposed || revision !== session.revision) {
            return;
          }

          dispatch({ type: "set-warnings", warnings: bundle.warnings });
          dispatch({ type: "set-compile", compile: { type: "ready" } });
        } catch (error) {
          if (session.disposed || revision !== session.revision) {
            return;
          }

          dispatch({
            type: "set-compile",
            compile: {
              type: "error",
              message: getCompilationErrorMessage(error),
            },
          });
        }
      });
    },
    [dispatch, entryPoint, host],
  );

  useEffect(() => {
    if (!host) {
      return;
    }

    const timeout = window.setTimeout(() => compile(files), 150);
    return () => window.clearTimeout(timeout);
  }, [compile, files, host]);

  useEffect(() => {
    const session = sessionRef.current;
    if (!host || !session || !selection) {
      return;
    }

    session.queue = session.queue.then(async () => {
      if (
        session.disposed ||
        !session.hasBundle ||
        sameSelection(selection, session.appliedSelection)
      ) {
        return;
      }

      session.appliedSelection = selection;
      dispatch({ type: "set-runtime-error", message: null });
      try {
        await host.selectComposition(selection);
      } catch (error) {
        if (!session.disposed) {
          dispatch({
            type: "set-compile",
            compile: { type: "error", message: getErrorMessage(error) },
          });
        }
      }
    });
  }, [dispatch, host, selection]);
};
