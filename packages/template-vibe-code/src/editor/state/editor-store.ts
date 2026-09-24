import type { PreviewZoom } from "@/preview/bridge";
import { filesAreEqual, type ProjectFiles } from "../model/project";

export type CompileStatus =
  | { type: "booting"; message: string }
  | { type: "compiling" }
  | { type: "ready" }
  | { type: "error"; message: string };

export type RenderJob = {
  id: string;
  compositionId: string;
  fileName: string;
  kind: "media" | "still";
  status: "rendering" | "done" | "error" | "cancelled";
  progress: number;
  url: string | null;
  sizeInBytes: number | null;
  error: string | null;
  startedAt: number;
  finishedAt: number | null;
};

export type Notice = {
  id: number;
  type: "error" | "info";
  message: string;
};

export type PlaybackSettings = {
  loop: boolean;
  playbackRate: number;
  inFrame: number | null;
  outFrame: number | null;
  zoom: PreviewZoom;
  showOutlines: boolean;
  checkerboard: boolean;
};

export type LayoutSettings = {
  showSidebar: boolean;
  showInspector: boolean;
  showCode: boolean;
  showTimeline: boolean;
  sidebarTab: "compositions" | "files";
  inspectorTab: "inspector" | "renders";
  sidebarWidth: number;
  inspectorWidth: number;
  codeWidth: number;
  timelineHeight: number;
};

export type EditorState = {
  files: ProjectFiles;
  savedFiles: ProjectFiles;
  past: ProjectFiles[];
  future: ProjectFiles[];
  lastEditKey: string | null;
  lastEditAt: number;
  openFiles: string[];
  activeFile: string | null;
  compositionId: string | null;
  propsOverride: Record<string, unknown> | null;
  compile: CompileStatus;
  warnings: string[];
  runtimeError: string | null;
  playback: PlaybackSettings;
  layout: LayoutSettings;
  renders: RenderJob[];
  notices: Notice[];
  dialog: "shortcuts" | "render" | null;
  revealRequest: {
    filePath: string;
    line: number;
    column: number;
    nonce: number;
  } | null;
};

export type EditorAction =
  | {
      type: "set-files";
      files: ProjectFiles;
      // Consecutive edits with the same key within a short time are merged
      // into a single undo step (e.g. typing).
      coalesceKey: string | null;
    }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "mark-saved" }
  | { type: "open-file"; filePath: string }
  | { type: "close-file"; filePath: string }
  | { type: "select-composition"; compositionId: string | null }
  | { type: "set-props-override"; props: Record<string, unknown> | null }
  | { type: "set-compile"; compile: CompileStatus }
  | { type: "set-warnings"; warnings: string[] }
  | { type: "set-runtime-error"; message: string | null }
  | { type: "set-playback"; patch: Partial<PlaybackSettings> }
  | { type: "set-layout"; patch: Partial<LayoutSettings> }
  | { type: "add-render"; job: RenderJob }
  | { type: "update-render"; id: string; patch: Partial<RenderJob> }
  | { type: "remove-render"; id: string }
  | { type: "notify"; notice: Omit<Notice, "id"> }
  | { type: "dismiss-notice"; id: number }
  | { type: "set-dialog"; dialog: EditorState["dialog"] }
  | {
      type: "reveal";
      filePath: string;
      line: number;
      column: number;
    };

const MAX_HISTORY = 200;
const COALESCE_WINDOW_MS = 1200;
let noticeId = 0;

export const createInitialState = ({
  files,
  activeFile,
}: {
  files: ProjectFiles;
  activeFile: string | null;
}): EditorState => ({
  files,
  savedFiles: files,
  past: [],
  future: [],
  lastEditKey: null,
  lastEditAt: 0,
  openFiles: activeFile ? [activeFile] : [],
  activeFile,
  compositionId: null,
  propsOverride: null,
  compile: { type: "booting", message: "Starting the preview…" },
  warnings: [],
  runtimeError: null,
  playback: {
    loop: true,
    playbackRate: 1,
    inFrame: null,
    outFrame: null,
    zoom: "fit",
    showOutlines: true,
    checkerboard: false,
  },
  layout: {
    showSidebar: true,
    showInspector: true,
    showCode: true,
    showTimeline: true,
    sidebarTab: "compositions",
    inspectorTab: "inspector",
    sidebarWidth: 232,
    inspectorWidth: 300,
    codeWidth: 520,
    timelineHeight: 260,
  },
  renders: [],
  notices: [],
  dialog: null,
  revealRequest: null,
});

export const editorReducer = (
  state: EditorState,
  action: EditorAction,
): EditorState => {
  switch (action.type) {
    case "set-files": {
      if (filesAreEqual(state.files, action.files)) {
        return state;
      }

      const now = Date.now();
      const coalesce =
        action.coalesceKey !== null &&
        action.coalesceKey === state.lastEditKey &&
        now - state.lastEditAt < COALESCE_WINDOW_MS;
      const past = coalesce
        ? state.past
        : [...state.past, state.files].slice(-MAX_HISTORY);
      const openFiles = state.openFiles.filter((file) => file in action.files);
      return {
        ...state,
        files: action.files,
        past,
        future: [],
        lastEditKey: action.coalesceKey,
        lastEditAt: now,
        openFiles,
        activeFile:
          state.activeFile && state.activeFile in action.files
            ? state.activeFile
            : (openFiles[0] ?? null),
      };
    }

    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) {
        return state;
      }

      return {
        ...state,
        files: previous,
        past: state.past.slice(0, -1),
        future: [state.files, ...state.future],
        lastEditKey: null,
      };
    }

    case "redo": {
      const [next, ...future] = state.future;
      if (!next) {
        return state;
      }

      return {
        ...state,
        files: next,
        past: [...state.past, state.files],
        future,
        lastEditKey: null,
      };
    }

    case "mark-saved":
      return { ...state, savedFiles: state.files };

    case "open-file":
      return {
        ...state,
        openFiles: state.openFiles.includes(action.filePath)
          ? state.openFiles
          : [...state.openFiles, action.filePath],
        activeFile: action.filePath,
      };

    case "close-file": {
      const openFiles = state.openFiles.filter(
        (file) => file !== action.filePath,
      );
      const index = state.openFiles.indexOf(action.filePath);
      return {
        ...state,
        openFiles,
        activeFile:
          state.activeFile === action.filePath
            ? (openFiles[Math.min(index, openFiles.length - 1)] ?? null)
            : state.activeFile,
      };
    }

    case "select-composition":
      return state.compositionId === action.compositionId
        ? state
        : {
            ...state,
            compositionId: action.compositionId,
            propsOverride: null,
            playback: { ...state.playback, inFrame: null, outFrame: null },
          };

    case "set-props-override":
      return { ...state, propsOverride: action.props };

    case "set-compile":
      return { ...state, compile: action.compile };

    case "set-warnings":
      return { ...state, warnings: action.warnings };

    case "set-runtime-error":
      return state.runtimeError === action.message
        ? state
        : { ...state, runtimeError: action.message };

    case "set-playback":
      return { ...state, playback: { ...state.playback, ...action.patch } };

    case "set-layout":
      return { ...state, layout: { ...state.layout, ...action.patch } };

    case "add-render":
      return { ...state, renders: [action.job, ...state.renders] };

    case "update-render":
      return {
        ...state,
        renders: state.renders.map((job) =>
          job.id === action.id ? { ...job, ...action.patch } : job,
        ),
      };

    case "remove-render":
      return {
        ...state,
        renders: state.renders.filter((job) => job.id !== action.id),
      };

    case "notify":
      return {
        ...state,
        notices: [...state.notices, { ...action.notice, id: ++noticeId }].slice(
          -3,
        ),
      };

    case "dismiss-notice":
      return {
        ...state,
        notices: state.notices.filter((notice) => notice.id !== action.id),
      };

    case "set-dialog":
      return { ...state, dialog: action.dialog };

    case "reveal":
      return {
        ...state,
        openFiles: state.openFiles.includes(action.filePath)
          ? state.openFiles
          : [...state.openFiles, action.filePath],
        activeFile: action.filePath,
        layout: { ...state.layout, showCode: true },
        revealRequest: {
          filePath: action.filePath,
          line: action.line,
          column: action.column,
          nonce: (state.revealRequest?.nonce ?? 0) + 1,
        },
      };

    default:
      return state;
  }
};

export const hasUnsavedChanges = (state: EditorState) =>
  !filesAreEqual(state.files, state.savedFiles);
