import {
  type CancelSignal,
  type DownloadBrowserProgressFn,
  type RenderMediaProgress,
  ensureBrowser,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import {rm} from "node:fs/promises";
import path from "node:path";
import {
  RENDER_CANCELLED_MESSAGE,
  type RenderResult,
  type RenderUpdate,
} from "./electron-api";
import {getCompositorPackage} from "./compositor-package";
import {
  bundleRemotionProject,
  getPrebuiltRemotionBundlePath,
  hasPrebuiltRemotionBundle,
} from "./remotion-bundle";
import {getPackagedBrowserPaths} from "./packaged-browser";
import type {HelloWorldProps} from "../remotion/types";

const compositionId = "HelloWorld";

function isRenderCancelledError(error: unknown): boolean {
  return error instanceof Error && error.message === RENDER_CANCELLED_MESSAGE;
}

function getBinariesDirectory({
  isPackaged,
  projectRoot,
}: {
  isPackaged: boolean;
  projectRoot: string;
}): string | null {
  if (!isPackaged) {
    return null;
  }

  const compositorPackage = getCompositorPackage({
    arch: process.arch,
    platform: process.platform,
  });

  return path.join(
    path.dirname(projectRoot),
    "app.asar.unpacked",
    "node_modules",
    compositorPackage,
  );
}

async function getServeUrl({
  isPackaged,
  projectRoot,
  onUpdate,
}: {
  isPackaged: boolean;
  projectRoot: string;
  onUpdate?: (update: RenderUpdate) => void;
}): Promise<string> {
  if (isPackaged) {
    if (!hasPrebuiltRemotionBundle(projectRoot)) {
      throw new Error(
        "The packaged app is missing its prebuilt Remotion bundle. Rebuild the Electron app.",
      );
    }

    onUpdate?.({
      type: "status",
      message: "Using the prebuilt Remotion bundle from the packaged app...",
    });

    return getPrebuiltRemotionBundlePath(projectRoot);
  }

  onUpdate?.({
    type: "status",
    message: "Bundling the Remotion project for development...",
  });

  return bundleRemotionProject({
    projectRoot,
    onUpdate,
  });
}

export const renderVideo = async ({
  isPackaged,
  outputPath,
  projectRoot,
  titleText,
  onUpdate,
  cancelSignal,
}: {
  isPackaged: boolean;
  outputPath: string;
  projectRoot: string;
  titleText: string;
  onUpdate?: (update: RenderUpdate) => void;
  cancelSignal?: CancelSignal;
}): Promise<RenderResult> => {
  let wasCancelled = false;
  const browserExecutable = isPackaged
    ? getPackagedBrowserPaths({
        arch: process.arch,
        platform: process.platform,
        projectRoot,
      })?.packagedBrowserExecutablePath ?? null
    : null;

  async function finishCancelledRender(): Promise<RenderResult> {
    await rm(outputPath, {force: true});
    return {
      cancelled: true as const,
      outputPath: null,
    };
  }

  cancelSignal?.(() => {
    wasCancelled = true;
  });

  const inputProps: HelloWorldProps = {
    titleText: titleText.trim() || "Hello from Electron",
  };

  try {
    onUpdate?.({
      type: "status",
      message: "Checking browser installation...",
    });

    await ensureBrowser({
      browserExecutable,
      onBrowserDownload: ({chromeMode}) => {
        const browserName =
          chromeMode === "chrome-for-testing" ? "Chrome" : "Chrome Headless Shell";
        const onProgress: DownloadBrowserProgressFn = (progress) => {
          onUpdate?.({
            type: "progress",
            stage: "browser-download",
            progress: progress.percent,
          });
        };

        onUpdate?.({
          type: "status",
          message: `Downloading ${browserName}...`,
        });

        return {
          version: null,
          onProgress,
        };
      },
    });

    if (wasCancelled) {
      return finishCancelledRender();
    }

    const serveUrl = await getServeUrl({
      isPackaged,
      projectRoot,
      onUpdate,
    });

    if (wasCancelled) {
      return finishCancelledRender();
    }

    const binariesDirectory = getBinariesDirectory({
      isPackaged,
      projectRoot,
    });

    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps,
      binariesDirectory,
      browserExecutable,
    });

    if (wasCancelled) {
      return finishCancelledRender();
    }

    onUpdate?.({
      type: "status",
      message: "Rendering video...",
    });

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      binariesDirectory,
      browserExecutable,
      cancelSignal,
      onProgress(progress: RenderMediaProgress) {
        onUpdate?.({
          type: "progress",
          stage: "rendering",
          progress: progress.progress * 100,
        });
      },
    });

    if (wasCancelled) {
      return finishCancelledRender();
    }

    return {
      cancelled: false,
      outputPath,
    }
  } catch (error) {
    if (wasCancelled || isRenderCancelledError(error)) {
      return finishCancelledRender();
    }

    throw error;
  }
};
