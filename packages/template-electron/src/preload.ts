import {contextBridge, ipcRenderer} from "electron";
import {
  RENDER_PROGRESS_CHANNEL,
  RENDER_VIDEO_CHANNEL,
  SELECT_RENDER_OUTPUT_CHANNEL,
  type RemotionElectronApi,
  type RenderResult,
  type RenderUpdate,
} from "./electron-api";

const api: RemotionElectronApi = {
  selectRenderOutput: () => {
    return ipcRenderer.invoke(SELECT_RENDER_OUTPUT_CHANNEL);
  },
  renderVideo: (input) => {
    return ipcRenderer.invoke(RENDER_VIDEO_CHANNEL, input) as Promise<RenderResult>;
  },
  onRenderUpdate: (listener) => {
    const handler = (_event: Electron.IpcRendererEvent, update: RenderUpdate) => {
      listener(update);
    };

    ipcRenderer.on(RENDER_PROGRESS_CHANNEL, handler);

    return () => {
      ipcRenderer.removeListener(RENDER_PROGRESS_CHANNEL, handler);
    };
  },
};

contextBridge.exposeInMainWorld("remotionElectron", api);
