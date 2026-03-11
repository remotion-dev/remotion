import {app, BrowserWindow, dialog, ipcMain, shell} from "electron";
import path from "node:path";
import {
  RENDER_PROGRESS_CHANNEL,
  RENDER_VIDEO_CHANNEL,
  SELECT_RENDER_OUTPUT_CHANNEL,
  type RenderRequest,
  type RenderResult,
  type RenderUpdate,
} from "./electron-api";
import {renderVideo} from "./render-video";

let mainWindow: BrowserWindow | null = null;
let activeRender: Promise<RenderResult> | null = null;

if (app.isPackaged) {
  process.chdir(app.getPath("userData"));
}

const sendRenderUpdate = (update: RenderUpdate) => {
  mainWindow?.webContents.send(RENDER_PROGRESS_CHANNEL, update);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

ipcMain.handle(SELECT_RENDER_OUTPUT_CHANNEL, async () => {
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

ipcMain.handle(RENDER_VIDEO_CHANNEL, async (_event, input: RenderRequest) => {
  if (activeRender) {
    throw new Error("A render is already in progress.");
  }

  activeRender = renderVideo({
    isPackaged: app.isPackaged,
    outputPath: input.outputPath,
    projectRoot: app.getAppPath(),
    titleText: input.titleText,
    onUpdate: sendRenderUpdate,
  });

  try {
    const result = await activeRender;
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
    activeRender = null;
  }
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
