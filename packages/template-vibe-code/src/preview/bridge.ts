// Types shared between the editor (Next.js app) and the preview iframe.
//
// The preview iframe hosts the <Canvas> with a development React build so
// Fast Refresh can hot-swap compiled code. Because both documents are
// same-origin, the editor talks to the iframe by calling functions on the
// object returned from `window.remotionVibeCodePreview`.

import type { BrowserBundle } from "@remotion/browser-bundler";
import type { BrowserComposition } from "@remotion/browser-bundler/runtime";
import type {
  CanvasController,
  CanvasSequenceNodePathResolver,
} from "@remotion/canvas";
import type { PlayerRef } from "@remotion/player";
import type {
  CanRenderMediaOnWebResult,
  WebRendererContainer,
  WebRendererQuality,
  WebRendererVideoCodec,
} from "@remotion/web-renderer";

export type PreviewZoom = "fit" | number;

export type PreviewOptions = {
  showOutlines: boolean;
  checkerboard: boolean;
  zoom: PreviewZoom;
  loop: boolean;
  playbackRate: number;
  inFrame: number | null;
  outFrame: number | null;
  resolveSequenceNodePathInfo: CanvasSequenceNodePathResolver | null;
};

export type PreviewCompositionSelection = {
  compositionId: string;
  inputProps: Record<string, unknown>;
};

export type PreviewSnapshot = {
  composition: BrowserComposition | null;
  playerReady: boolean;
};

export type PreviewKeyEvent = {
  key: string;
  code: string;
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  repeat: boolean;
  isEditable: boolean;
};

export type PreviewMediaRenderRequest = {
  kind: "media";
  container: WebRendererContainer;
  videoCodec: WebRendererVideoCodec | null;
  videoBitrate: WebRendererQuality;
  scale: number;
  frameRange: [number, number] | null;
  muted: boolean;
};

export type PreviewStillRenderRequest = {
  kind: "still";
  frame: number;
  format: "png" | "jpeg";
  scale: number;
};

export type PreviewRenderRequest =
  | PreviewMediaRenderRequest
  | PreviewStillRenderRequest;

export type PreviewRenderProgress = {
  progress: number;
  renderedFrames: number;
  encodedFrames: number;
};

export type PreviewRenderResult = {
  url: string;
  sizeInBytes: number;
  mimeType: string;
};

export type PreviewHost = {
  readonly controller: CanvasController;
  applyBundle: (bundle: BrowserBundle) => Promise<void>;
  selectComposition: (
    selection: PreviewCompositionSelection,
  ) => Promise<BrowserComposition>;
  setOptions: (options: Partial<PreviewOptions>) => void;
  getPlayer: () => PlayerRef | null;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PreviewSnapshot;
  canRenderMedia: (
    request: PreviewMediaRenderRequest,
  ) => Promise<CanRenderMediaOnWebResult>;
  render: (
    request: PreviewRenderRequest,
    callbacks: {
      onProgress: (progress: PreviewRenderProgress) => void;
      signal: AbortSignal;
    },
  ) => Promise<PreviewRenderResult>;
  dispose: () => void;
};

export type CreatePreviewHost = (callbacks: {
  onError: (message: string) => void;
  onKeyDown: (event: PreviewKeyEvent) => boolean;
}) => PreviewHost;

declare global {
  interface Window {
    remotionVibeCodePreview: Promise<CreatePreviewHost> | null;
  }
}
