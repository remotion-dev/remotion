"use client";

import { resolveCompositionComponent } from "@remotion/codemods";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useSyncExternalStore,
} from "react";
import type { PreviewKeyEvent } from "@/preview/bridge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorLayout } from "./components/EditorLayout";
import { Notices } from "./components/Notices";
import { RenderDialog } from "./components/RenderDialog";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { useCompiler } from "./hooks/use-compiler";
import { useEditorActions } from "./hooks/use-editor-actions";
import { useEditorShortcuts } from "./hooks/use-editor-shortcuts";
import { useLayers } from "./hooks/use-layers";
import { usePlaybackStore } from "./hooks/use-playback";
import { usePreviewHost } from "./hooks/use-preview-host";
import { findCompositionFile, getCompositions } from "./model/compositions";
import { toCodemodProject, type ProjectFiles } from "./model/project";
import { EditorContext, type EditorContextValue } from "./state/editor-context";
import {
  createInitialState,
  editorReducer,
  hasUnsavedChanges,
} from "./state/editor-store";

const noopSubscribe = () => () => {};

export const Editor: React.FC<{
  readonly initialFiles: ProjectFiles;
  readonly entryPoint: string;
  readonly canSave: boolean;
}> = ({ initialFiles, entryPoint, canSave }) => {
  const [state, dispatch] = useReducer(editorReducer, initialFiles, (files) => {
    const project = toCodemodProject(files);
    const compositionFile = findCompositionFile(project);
    const compositions = getCompositions(project, compositionFile);
    const first = compositions[0];
    let activeFile = compositionFile;
    if (first && compositionFile) {
      try {
        activeFile = resolveCompositionComponent({
          project,
          compositionFile,
          compositionId: first.id,
        }).filePath;
      } catch {
        // Fall back to the composition file.
      }
    }

    return createInitialState({
      files,
      activeFile: activeFile ?? Object.keys(files)[0] ?? null,
    });
  });

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const project = useMemo(() => toCodemodProject(state.files), [state.files]);
  const compositionFile = useMemo(
    () => findCompositionFile(project),
    [project],
  );
  const compositions = useMemo(
    () => getCompositions(project, compositionFile),
    [compositionFile, project],
  );
  const activeComposition = useMemo(
    () =>
      compositions.find(
        (composition) => composition.id === state.compositionId,
      ) ?? null,
    [compositions, state.compositionId],
  );

  useEffect(() => {
    if (!activeComposition && compositions.length > 0) {
      dispatch({
        type: "select-composition",
        compositionId: compositions[0].id,
      });
    }
  }, [activeComposition, compositions]);

  const mainFile = useMemo(() => {
    if (!activeComposition || !compositionFile) {
      return null;
    }

    try {
      return resolveCompositionComponent({
        project,
        compositionFile,
        compositionId: activeComposition.id,
      }).filePath;
    } catch {
      return null;
    }
  }, [activeComposition, compositionFile, project]);

  // Switching compositions opens the file that defines it.
  const previousCompositionId = useRef(state.compositionId);
  useEffect(() => {
    if (previousCompositionId.current === state.compositionId) {
      return;
    }

    previousCompositionId.current = state.compositionId;
    if (mainFile) {
      dispatch({ type: "open-file", filePath: mainFile });
    }
  }, [mainFile, state.compositionId]);

  const onPreviewError = useCallback((message: string) => {
    dispatch({ type: "set-runtime-error", message });
  }, []);
  const shortcutHandlerRef = useRef<(event: PreviewKeyEvent) => boolean>(
    () => false,
  );
  const onPreviewKeyDown = useCallback(
    (event: PreviewKeyEvent) => shortcutHandlerRef.current(event),
    [],
  );

  const { host, error: hostError } = usePreviewHost({
    iframeRef,
    onError: onPreviewError,
    onKeyDown: onPreviewKeyDown,
  });
  const playback = usePlaybackStore({ host, onError: onPreviewError });
  const composition = useSyncExternalStore(
    host?.subscribe ?? noopSubscribe,
    () => host?.getSnapshot().composition ?? null,
    () => null,
  );
  const layers = useLayers({ host, project, mainFile });

  const selection = useMemo(
    () =>
      activeComposition
        ? {
            compositionId: activeComposition.id,
            inputProps: state.propsOverride ?? {},
          }
        : null,
    [activeComposition, state.propsOverride],
  );
  useCompiler({
    host,
    files: state.files,
    entryPoint,
    selection,
    dispatch,
  });

  useEffect(() => {
    if (hostError) {
      dispatch({
        type: "set-compile",
        compile: { type: "error", message: hostError },
      });
    }
  }, [hostError]);

  const {
    loop,
    playbackRate,
    inFrame,
    outFrame,
    zoom,
    showOutlines,
    checkerboard,
  } = state.playback;
  useEffect(() => {
    host?.setOptions({
      loop,
      playbackRate,
      inFrame,
      outFrame,
      zoom,
      showOutlines,
      checkerboard,
    });
  }, [
    checkerboard,
    host,
    inFrame,
    loop,
    outFrame,
    playbackRate,
    showOutlines,
    zoom,
  ]);

  const compositionDurationInFrames =
    composition?.durationInFrames ?? activeComposition?.durationInFrames ?? 1;
  const compositionFps = composition?.fps ?? activeComposition?.fps ?? 30;
  const compositionWidth =
    composition?.width ?? activeComposition?.width ?? 1920;
  const compositionHeight =
    composition?.height ?? activeComposition?.height ?? 1080;

  const actions = useEditorActions({
    context: {
      state,
      entryPoint,
      host,
      layers,
      compositions,
      compositionFile,
      activeComposition,
      compositionDurationInFrames,
      compositionFps,
      compositionWidth,
      compositionHeight,
    },
    dispatch,
    playback,
    canSave,
  });

  shortcutHandlerRef.current = useEditorShortcuts({
    actions,
    playback,
    context: { state, host, layers, compositions, fps: compositionFps },
  });

  useEffect(() => {
    if (state.notices.length === 0) {
      return;
    }

    const [oldest] = state.notices;
    const timeout = window.setTimeout(
      () => dispatch({ type: "dismiss-notice", id: oldest.id }),
      oldest.type === "error" ? 8000 : 3500,
    );
    return () => window.clearTimeout(timeout);
  }, [state.notices]);

  const unsaved = hasUnsavedChanges(state);
  useEffect(() => {
    if (!unsaved) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsaved]);

  const value: EditorContextValue = {
    state,
    dispatch,
    entryPoint,
    canSave,
    host,
    hostError,
    playback,
    layers,
    project,
    compositions,
    compositionFile,
    mainFile,
    activeComposition,
    composition,
    actions,
  };

  return (
    <EditorContext.Provider value={value}>
      <TooltipProvider>
        <EditorLayout iframeRef={iframeRef} />
        <ShortcutsDialog />
        <RenderDialog />
        <Notices />
      </TooltipProvider>
    </EditorContext.Provider>
  );
};
