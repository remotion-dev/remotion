"use client";

import type { BrowserComposition } from "@remotion/browser-bundler/runtime";
import type { CodemodProject } from "@remotion/codemods";
import { createContext, useContext } from "react";
import type { PreviewHost } from "@/preview/bridge";
import type { EditorActions } from "../hooks/use-editor-actions";
import type { PlaybackStore } from "../hooks/use-playback";
import type { CompositionInfo } from "../model/compositions";
import type { Layer } from "../model/layers";
import type { EditorAction, EditorState } from "./editor-store";

export type EditorContextValue = {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
  /** The file that calls registerRoot(); it cannot be renamed or deleted. */
  entryPoint: string;
  canSave: boolean;
  host: PreviewHost | null;
  hostError: string | null;
  playback: PlaybackStore;
  layers: Layer[];
  project: CodemodProject;
  compositions: CompositionInfo[];
  compositionFile: string | null;
  /** The file that defines the component of the active composition. */
  mainFile: string | null;
  activeComposition: CompositionInfo | null;
  /** Metadata of the composition currently mounted in the preview. */
  composition: BrowserComposition | null;
  actions: EditorActions;
};

export const EditorContext = createContext<EditorContextValue | null>(null);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor() must be used inside <Editor>");
  }

  return context;
};
