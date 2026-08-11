import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  shell,
  type IpcMainInvokeEvent,
} from "electron";
import {makeCancelSignal} from "@remotion/renderer";
import path from "node:path";
import {
  CANCEL_RENDER_CHANNEL,
  RENDER_CANCELLED_MESSAGE,
  RENDER_PROGRESS_CHANNEL,
  RENDER_VIDEO_CHANNEL,
  SELECT_RENDER_OUTPUT_CHANNEL,
  type RenderRequest,
  type RenderResult,
  type RenderUpdate,
} from "./electron-api";
import {
  getIntegrationRenderOutputPath,
  runIntegrationRenderTest,
} from "./integration-render-test-mode";
import {renderVideo} from "./render-video";

let mainWindow: BrowserWindow | null = null;
let activeRender: Promise<RenderResult> | null = null;
const integrationRenderOutputPath = getIntegrationRenderOutputPath();
let currentWindowProgressBarValue = -1;
let cancelActiveRender: (() => void) | null = null;
const INDETERMINATE_PROGRESS_BAR = 2;

if (app.isPackaged) {
  process.chdir(app.getPath("userData"));
}

function sendRenderUpdate(update: RenderUpdate): void {
  mainWindow?.webContents.send(RENDER_PROGRESS_CHANNEL, update);

  if (update.type === "progress") {
    setWindowProgressBar(Math.max(0, Math.min(1, update.progress / 100 || 0)));
  }
}

function setWindowProgressBar(progress: number): void {
  currentWindowProgressBarValue = progress;
  mainWindow?.setProgressBar(currentWindowProgressBarValue);
}

function assertTrustedSender(event: IpcMainInvokeEvent): void {
  if (!mainWindow || event.sender.id !== mainWindow.webContents.id) {
    throw new Error("Blocked IPC call from an unknown renderer.");
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => {
    return {action: "deny"};
  });
  mainWindow.setProgressBar(currentWindowProgressBarValue);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

ipcMain.handle(SELECT_RENDER_OUTPUT_CHANNEL, async (event: IpcMainInvokeEvent) => {
  assertTrustedSender(event);

  const defaultPath = path.join(
    app.getPath("downloads"),
    `remotion-electron-${Date.now()}.mp4`,
  );
  const options = {
    defaultPath,
    filters: [
      {
        name: "MP4 video",
        extensions: ["mp4"],
      },
    ],
    properties: ["showOverwriteConfirmation"] as (
      | "showOverwriteConfirmation"
      | "showHiddenFiles"
      | "createDirectory"
      | "treatPackageAsDirectory"
      | "dontAddToRecent"
    )[],
  };
  const result = mainWindow
    ? await dialog.showSaveDialog(mainWindow, options)
    : await dialog.showSaveDialog(options);

  return {
    canceled: result.canceled,
    outputPath: result.filePath ?? null,
  };
});

ipcMain.handle(
  RENDER_VIDEO_CHANNEL,
  async (event: IpcMainInvokeEvent, input: RenderRequest) => {
  assertTrustedSender(event);

  if (activeRender) {
    throw new Error("A render is already in progress.");
  }

  if (!path.isAbsolute(input.outputPath)) {
    throw new Error("Output path must be absolute.");
  }

  setWindowProgressBar(INDETERMINATE_PROGRESS_BAR);
  const {cancel, cancelSignal} = makeCancelSignal();
  cancelActiveRender = cancel;
  activeRender = renderVideo({
    isPackaged: app.isPackaged,
    outputPath: input.outputPath,
    projectRoot: app.getAppPath(),
    titleText: input.titleText,
    onUpdate: sendRenderUpdate,
    cancelSignal,
  });

  try {
    const result = await activeRender;
    if (result.cancelled) {
      sendRenderUpdate({
        type: "status",
        message: RENDER_CANCELLED_MESSAGE,
      });
      return result;
    }

    shell.showItemInFolder(result.outputPath);
    sendRenderUpdate({
      type: "status",
      message: `Render complete: ${result.outputPath}`,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rendering failed.";
    sendRenderUpdate({
      type: "status",
      message: `Render failed: ${message}`,
    });
    throw error;
  } finally {
    setWindowProgressBar(-1);
    cancelActiveRender = null;
    activeRender = null;
  }
  },
);

ipcMain.handle(CANCEL_RENDER_CHANNEL, async (event: IpcMainInvokeEvent) => {
  assertTrustedSender(event);

  if (!activeRender || !cancelActiveRender) {
    return {didCancel: false};
  }

  cancelActiveRender();
  return {didCancel: true};
});

app.on("ready", () => {
  if (integrationRenderOutputPath) {
    void runIntegrationRenderTest(integrationRenderOutputPath);
    return;
  }

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (integrationRenderOutputPath) {
    return;
  }

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
