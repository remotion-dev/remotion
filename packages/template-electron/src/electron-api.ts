export const RENDER_VIDEO_CHANNEL = "remotion-electron:render-video";
export const RENDER_PROGRESS_CHANNEL = "remotion-electron:render-progress";
export const SELECT_RENDER_OUTPUT_CHANNEL = "remotion-electron:select-render-output";

export type RenderRequest = {
  titleText: string;
  outputPath: string;
};

export type RenderResult = {
  outputPath: string;
};

export type SaveDialogResult = {
  canceled: boolean;
  outputPath: string | null;
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
  onRenderUpdate: (listener: (update: RenderUpdate) => void) => () => void;
};

declare global {
  interface Window {
    remotionElectron: RemotionElectronApi;
  }
}
