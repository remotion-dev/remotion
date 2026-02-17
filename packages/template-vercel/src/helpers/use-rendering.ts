import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { CompositionProps } from "../../types/constants";
import { SSEMessage } from "../../types/schema";

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

  const renderMedia = useCallback(async () => {
    setState({
      status: "invoking",
      phase: "Starting...",
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const json = line.slice(6);
          const message = JSON.parse(json) as SSEMessage;

          if (message.type === "phase") {
            setState((prev) => {
              if (prev.status !== "invoking") return prev;
              return {
                ...prev,
                phase: message.phase,
                progress: message.progress,
                subtitle: message.subtitle ?? null,
              };
            });
          } else if (message.type === "done") {
            setState({
              status: "done",
              url: message.url,
              size: message.size,
            });
          } else if (message.type === "error") {
            setState({
              status: "error",
              error: new Error(message.message),
            });
          }
        }
      }
    } catch (err) {
      setState({
        status: "error",
        error: err as Error,
      });
    }
  }, [id, inputProps]);

  const undo = useCallback(() => {
    setState({ status: "init" });
  }, []);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
