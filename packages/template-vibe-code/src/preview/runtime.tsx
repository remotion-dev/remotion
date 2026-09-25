import {
  createBrowserBundleRuntime,
  createBrowserCompositionObserver,
  type BrowserComposition,
} from "@remotion/browser-bundler/runtime";
import { Canvas, createCanvasController } from "@remotion/canvas";
import type { PlayerRef } from "@remotion/player";
import {
  canRenderMediaOnWeb,
  renderMediaOnWeb,
  renderStillOnWeb,
} from "@remotion/web-renderer";
import React, { useCallback, useEffect, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import type {
  CreatePreviewHost,
  PreviewCompositionSelection,
  PreviewKeyEvent,
  PreviewOptions,
} from "./bridge";

type PreviewState = {
  root: React.FC | null;
  selection: PreviewCompositionSelection | null;
  composition: BrowserComposition | null;
  // The revision that was current when `composition` was resolved.
  compositionRevision: number;
  options: PreviewOptions;
  revision: number;
  player: PlayerRef | null;
};

const defaultOptions: PreviewOptions = {
  showOutlines: true,
  checkerboard: false,
  zoom: "fit",
  loop: true,
  playbackRate: 1,
  inFrame: null,
  outFrame: null,
  resolveSequenceNodePathInfo: null,
};

const createPreviewStore = () => {
  let state: PreviewState = {
    root: null,
    selection: null,
    composition: null,
    compositionRevision: 0,
    options: defaultOptions,
    revision: 0,
    player: null,
  };
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getState: () => state,
    setState: (patch: Partial<PreviewState>) => {
      state = { ...state, ...patch };
      emit();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

type PreviewStore = ReturnType<typeof createPreviewStore>;

const checkerboard =
  "repeating-conic-gradient(#1c2029 0% 25%, #12151c 0% 50%) 50% / 28px 28px";

const PreviewApp: React.FC<{
  readonly store: PreviewStore;
  readonly controller: ReturnType<typeof createCanvasController>;
  readonly onReady: (revision: number) => void;
}> = ({ store, controller, onReady }) => {
  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );
  const { composition, options, compositionRevision } = state;

  useEffect(() => {
    if (composition) {
      onReady(compositionRevision);
    }
  }, [composition, onReady, compositionRevision]);

  // A stable ref callback: a new function on every render would be re-invoked
  // by React on each commit and loop through the store.
  const setPlayer = useCallback(
    (player: PlayerRef | null) => {
      if (store.getState().player !== player) {
        store.setState({ player });
      }
    },
    [store],
  );

  if (!composition) {
    return (
      <div
        className="preview-loading"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
        }}
      >
        Waiting for the first compilation…
      </div>
    );
  }

  const fit = options.zoom === "fit";
  const zoom = typeof options.zoom === "number" ? options.zoom : 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: fit ? "hidden" : "auto",
        background: options.checkerboard ? checkerboard : "#050608",
      }}
    >
      <div
        style={
          fit
            ? {
                position: "absolute",
                inset: 20,
              }
            : {
                minWidth: "100%",
                minHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                padding: 40,
              }
        }
      >
        <Canvas
          key={composition.id}
          ref={setPlayer}
          controller={controller}
          showOutlines={options.showOutlines}
          resolveSequenceNodePathInfo={
            options.resolveSequenceNodePathInfo ?? undefined
          }
          component={composition.component}
          inputProps={composition.props}
          compositionWidth={composition.width}
          compositionHeight={composition.height}
          fps={composition.fps}
          durationInFrames={composition.durationInFrames}
          controls={false}
          loop={options.loop}
          playbackRate={options.playbackRate}
          inFrame={options.inFrame}
          outFrame={options.outFrame}
          spaceKeyToPlayOrPause={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          acknowledgeRemotionLicense
          errorFallback={({ error }) => (
            <div
              role="alert"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 32,
                color: "#fca5a5",
                backgroundColor: "#1a0f12",
                fontFamily: "monospace",
                fontSize: 14,
                whiteSpace: "pre-wrap",
              }}
            >
              {error.message}
            </div>
          )}
          style={
            fit
              ? { width: "100%", height: "100%" }
              : {
                  width: composition.width * zoom,
                  height: composition.height * zoom,
                  flexShrink: 0,
                }
          }
        />
      </div>
    </div>
  );
};

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA");

export const createPreviewHost: CreatePreviewHost = ({
  onError,
  onKeyDown,
}) => {
  const container = document.getElementById("preview-root");
  if (!container) {
    throw new Error("The preview container was not found.");
  }

  const store = createPreviewStore();
  const controller = createCanvasController();
  const runtime = createBrowserBundleRuntime();
  let disposed = false;
  let waiters: {
    resolve: (composition: BrowserComposition) => void;
    reject: (error: Error) => void;
    timeout: number;
  }[] = [];

  const settleWaiters = (
    result:
      | { type: "resolved"; composition: BrowserComposition }
      | { type: "rejected"; error: Error },
  ) => {
    const pending = waiters;
    waiters = [];
    for (const waiter of pending) {
      window.clearTimeout(waiter.timeout);
      if (result.type === "resolved") {
        waiter.resolve(result.composition);
      } else {
        waiter.reject(result.error);
      }
    }
  };

  const reportError = (error: unknown) => {
    if (disposed) {
      return;
    }

    // React does not log errors itself when custom error handlers are set.
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    settleWaiters({ type: "rejected", error: new Error(message) });
    onError(message);
  };

  const onReady = (readyRevision: number) => {
    const { composition, revision } = store.getState();
    if (composition && readyRevision === revision) {
      settleWaiters({ type: "resolved", composition });
    }
  };

  const root = createRoot(container, {
    onCaughtError: reportError,
    onUncaughtError: reportError,
  });
  root.render(
    <PreviewApp store={store} controller={controller} onReady={onReady} />,
  );

  const observer = createBrowserCompositionObserver({
    onChange: (composition) => {
      store.setState({
        composition,
        compositionRevision: store.getState().revision,
      });
    },
    onError: reportError,
  });

  const resolveSelection = (selection: PreviewCompositionSelection) => {
    const { root: registeredRoot } = store.getState();
    if (!registeredRoot) {
      throw new Error("Compile the project before selecting a composition.");
    }

    const revision = store.getState().revision + 1;
    store.setState({ revision, selection });
    return new Promise<BrowserComposition>((resolve, reject) => {
      waiters.push({
        resolve,
        reject,
        timeout: window.setTimeout(() => {
          reportError(
            new Error(
              `Timed out while resolving the composition "${selection.compositionId}".`,
            ),
          );
        }, 30_000),
      });
      observer.update({
        root: registeredRoot,
        compositionId: selection.compositionId,
        inputProps: selection.inputProps,
      });
    });
  };

  const keyListener = (event: KeyboardEvent) => {
    const normalized: PreviewKeyEvent = {
      key: event.key,
      code: event.code,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      repeat: event.repeat,
      isEditable: isEditableTarget(event.target),
    };
    if (onKeyDown(normalized)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  window.addEventListener("keydown", keyListener);

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    window.removeEventListener("pagehide", dispose);
    window.removeEventListener("keydown", keyListener);
    settleWaiters({
      type: "rejected",
      error: new Error("The preview was disposed."),
    });
    try {
      root.unmount();
    } finally {
      try {
        observer.dispose();
      } finally {
        runtime.dispose();
      }
    }
  };
  window.addEventListener("pagehide", dispose);

  const getCompositionForRender = () => {
    const { composition, player } = store.getState();
    if (!composition) {
      throw new Error("There is no composition to render yet.");
    }

    player?.pause();
    return composition;
  };

  return {
    controller,
    applyBundle: async (bundle) => {
      if (disposed) {
        throw new Error("The preview was disposed.");
      }

      const registeredRoot = await runtime.applyBundle(bundle);
      if (disposed) {
        throw new Error("The preview was disposed.");
      }

      store.setState({ root: registeredRoot });
      const { selection } = store.getState();
      if (selection) {
        await resolveSelection(selection);
      }
    },
    selectComposition: (selection) => {
      if (disposed) {
        return Promise.reject(new Error("The preview was disposed."));
      }

      return resolveSelection(selection);
    },
    setOptions: (options) => {
      store.setState({
        options: { ...store.getState().options, ...options },
      });
    },
    getPlayer: () => store.getState().player,
    subscribe: store.subscribe,
    getSnapshot: () => {
      const { composition, player } = store.getState();
      return { composition, playerReady: player !== null };
    },
    canRenderMedia: async (request) => {
      const { composition } = store.getState();
      if (!composition) {
        throw new Error("There is no composition to render yet.");
      }

      return canRenderMediaOnWeb({
        container: request.container,
        videoCodec: request.videoCodec,
        width: Math.round(composition.width * request.scale),
        height: Math.round(composition.height * request.scale),
        muted: request.muted,
        videoBitrate: request.videoBitrate,
      });
    },
    render: async (request, { onProgress, signal }) => {
      const composition = getCompositionForRender();
      const compositionForRenderer = {
        component: composition.component,
        id: composition.id,
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        durationInFrames: composition.durationInFrames,
      };

      if (request.kind === "still") {
        const still = await renderStillOnWeb({
          composition: compositionForRenderer,
          inputProps: composition.props,
          frame: request.frame,
          scale: request.scale,
          signal,
        });
        const blob = await still.blob({ format: request.format });
        return {
          url: URL.createObjectURL(blob),
          sizeInBytes: blob.size,
          mimeType: blob.type,
        };
      }

      const { getBlob } = await renderMediaOnWeb({
        composition: compositionForRenderer,
        inputProps: composition.props,
        container: request.container,
        videoCodec: request.videoCodec,
        videoBitrate: request.videoBitrate,
        scale: request.scale,
        muted: request.muted,
        frameRange: request.frameRange,
        signal,
        onProgress: (progress) => {
          onProgress({
            progress: progress.progress,
            renderedFrames: progress.renderedFrames,
            encodedFrames: progress.encodedFrames,
          });
        },
      });
      const blob = await getBlob();
      return {
        url: URL.createObjectURL(blob),
        sizeInBytes: blob.size,
        mimeType: blob.type,
      };
    },
    dispose,
  };
};
