import type { RenderProgress } from "@remotion/vercel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { CompositionProps } from "../../types/constants";

const STORAGE_KEY = "remotion-render-handle";
const MAX_HANDLE_AGE = 5 * 60 * 60 * 1000;

type StoredHandle = {
  sandboxId: string;
  cmdId: string;
  startedAt: number;
};

type RenderHandle = Pick<StoredHandle, "sandboxId" | "cmdId">;

export type State =
  | {
      status: "init";
    }
  | {
      status: "invoking";
      phase: string;
      progress: number;
      subtitle: string | null;
    }
  | {
      status: "error";
      error: Error;
    }
  | {
      url: string;
      size: number;
      status: "done";
    };

export const useRendering = (
  id: string,
  inputProps: z.infer<typeof CompositionProps>,
) => {
  const [state, setState] = useState<State>({
    status: "init",
  });
  const abortController = useRef<AbortController | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStoredHandle = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const stopPolling = useCallback(() => {
    abortController.current?.abort();
    abortController.current = null;

    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const updateInvokingState = useCallback((progress: RenderProgress) => {
    switch (progress.stage) {
      case "starting":
        setState({
          status: "invoking",
          phase: "Starting render...",
          progress: progress.overallProgress,
          subtitle: null,
        });
        return;
      case "opening-browser":
        setState({
          status: "invoking",
          phase: "Opening browser...",
          progress: progress.overallProgress,
          subtitle: null,
        });
        return;
      case "selecting-composition":
        setState({
          status: "invoking",
          phase: "Selecting composition...",
          progress: progress.overallProgress,
          subtitle: null,
        });
        return;
      case "render-progress":
        setState({
          status: "invoking",
          phase: "Rendering video...",
          progress: progress.overallProgress,
          subtitle: null,
        });
        return;
      case "uploading":
        setState({
          status: "invoking",
          phase: "Uploading video...",
          progress: progress.overallProgress,
          subtitle: null,
        });
        return;
      default:
        return;
    }
  }, []);

  const startPolling = useCallback(
    (handle: RenderHandle) => {
      stopPolling();

      const controller = new AbortController();
      abortController.current = controller;

      const poll = async () => {
        try {
          const params = new URLSearchParams({
            sandboxId: handle.sandboxId,
            cmdId: handle.cmdId,
          });
          const response = await fetch(`/api/render/progress?${params}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error("Failed to check render progress");
          }

          const progress = (await response.json()) as RenderProgress;

          switch (progress.stage) {
            case "done":
              clearStoredHandle();
              stopPolling();
              setState({
                status: "done",
                url: progress.url,
                size: progress.size,
              });
              return;
            case "error":
              clearStoredHandle();
              stopPolling();
              setState({
                status: "error",
                error: new Error(progress.message),
              });
              return;
            case "expired":
              clearStoredHandle();
              stopPolling();
              setState({
                status: "error",
                error: new Error("The render sandbox expired."),
              });
              return;
            default:
              updateInvokingState(progress);
              timeout.current = setTimeout(poll, 1000);
          }
        } catch (err) {
          if (controller.signal.aborted) {
            return;
          }

          clearStoredHandle();
          stopPolling();
          setState({
            status: "error",
            error: err as Error,
          });
        }
      };

      void poll();
    },
    [clearStoredHandle, stopPolling, updateInvokingState],
  );

  const renderMedia = useCallback(async () => {
    stopPolling();
    setState({
      status: "invoking",
      phase: "Preparing render...",
      progress: 0,
      subtitle: null,
    });

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, inputProps }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to start render");
      }

      const handle = (await response.json()) as RenderHandle;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...handle, startedAt: Date.now() }),
      );
      startPolling(handle);
    } catch (err) {
      clearStoredHandle();
      setState({
        status: "error",
        error: err as Error,
      });
    }
  }, [clearStoredHandle, id, inputProps, startPolling, stopPolling]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return stopPolling;
    }

    try {
      const handle = JSON.parse(raw) as StoredHandle;
      if (Date.now() - handle.startedAt > MAX_HANDLE_AGE) {
        clearStoredHandle();
        return stopPolling;
      }

      setState({
        status: "invoking",
        phase: "Resuming render...",
        progress: 0,
        subtitle: null,
      });
      startPolling(handle);
    } catch {
      clearStoredHandle();
    }

    return stopPolling;
  }, [clearStoredHandle, startPolling, stopPolling]);

  const undo = useCallback(() => {
    stopPolling();
    clearStoredHandle();
    setState({ status: "init" });
  }, [clearStoredHandle, stopPolling]);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
