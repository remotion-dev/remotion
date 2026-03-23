import type {HelloWorldProps} from "../remotion/types";

export const RENDER_VIDEO_CHANNEL = "remotion-electron:render-video";
export const RENDER_PROGRESS_CHANNEL = "remotion-electron:render-progress";
export const SELECT_RENDER_OUTPUT_CHANNEL = "remotion-electron:select-render-output";
export const CANCEL_RENDER_CHANNEL = "remotion-electron:cancel-render";
export const RENDER_CANCELLED_MESSAGE = "Render cancelled.";

export type RenderRequest = HelloWorldProps & {
  outputPath: string;
};

export type RenderResult =
  | {
      cancelled: false;
      outputPath: string;
    }
  | {
      cancelled: true;
      outputPath: null;
    };

export type SaveDialogResult = {
  canceled: boolean;
  outputPath: string | null;
};

export type CancelRenderResult = {
  didCancel: boolean;
};

export type RenderUpdate =
  | {
      type: "status";
      message: string;
    }
  | {
      type: "progress";
      stage: "browser-download" | "bundling" | "rendering";
      progress: number;
    };

export type RemotionElectronApi = {
  selectRenderOutput: () => Promise<SaveDialogResult>;
  renderVideo: (input: RenderRequest) => Promise<RenderResult>;
  cancelRender: () => Promise<CancelRenderResult>;
  onRenderUpdate: (listener: (update: RenderUpdate) => void) => () => void;
};

declare global {
  interface Window {
    remotionElectron: RemotionElectronApi;
  }
}
