import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { CompositionProps } from "../../types/constants";
import { renderVideo } from "../lambda/api";

export type State =
  | {
      status: "init";
    }
  | {
      status: "invoking";
    }
  | {
      renderId: string;
      bucketName: string;
      progress: number;
      status: "rendering";
    }
  | {
      renderId: string | null;
      status: "error";
      error: Error;
    }
  | {
      url: string;
      size: number;
      status: "done";
    };

export const useRendering = (inputProps: z.infer<typeof CompositionProps>) => {
  const [state, setState] = useState<State>({
    status: "init",
  });

  const renderMedia = useCallback(async () => {
    setState({
      status: "invoking",
    });
    let renderId: string | null = null;
    try {
      await renderVideo({
        inputProps,
        onEvent: (event) => {
          switch (event.type) {
            case "started": {
              renderId = event.renderId;
              setState({
                status: "rendering",
                renderId: event.renderId,
                bucketName: event.bucketName,
                progress: 0,
              });
              break;
            }
            case "progress": {
              setState((current) =>
                current.status === "rendering"
                  ? { ...current, progress: event.progress }
                  : current,
              );
              break;
            }
            case "done": {
              setState({ status: "done", url: event.url, size: event.size });
              break;
            }
            case "error": {
              setState({
                status: "error",
                renderId,
                error: new Error(event.message),
              });
              break;
            }
          }
        },
      });
    } catch (err) {
      setState({
        status: "error",
        renderId,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }, [inputProps]);

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
