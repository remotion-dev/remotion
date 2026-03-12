import {ensureBrowser, renderMedia, selectComposition} from "@remotion/renderer";
import path from "node:path";
import type {RenderResult, RenderUpdate} from "./electron-api";
import {getCompositorPackage} from "./compositor-package";
import {
  bundleRemotionProject,
  getPrebuiltRemotionBundlePath,
  hasPrebuiltRemotionBundle,
} from "./remotion-bundle";

const compositionId = "HelloWorld";

const getBinariesDirectory = ({
  isPackaged,
  projectRoot,
}: {
  isPackaged: boolean;
  projectRoot: string;
}) => {
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
};

const getServeUrl = async ({
  isPackaged,
  projectRoot,
  onUpdate,
}: {
  isPackaged: boolean;
  projectRoot: string;
  onUpdate?: (update: RenderUpdate) => void;
}) => {
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
};

export const renderVideo = async ({
  isPackaged,
  outputPath,
  projectRoot,
  titleText,
  onUpdate,
}: {
  isPackaged: boolean;
  outputPath: string;
  projectRoot: string;
  titleText: string;
  onUpdate?: (update: RenderUpdate) => void;
}): Promise<RenderResult> => {
  onUpdate?.({
    type: "status",
    message: "Checking browser installation...",
  });
  await ensureBrowser({
    onBrowserDownload: ({chromeMode}) => {
      const browserName =
        chromeMode === "chrome-for-testing" ? "Chrome" : "Chrome Headless Shell";

      onUpdate?.({
        type: "status",
        message: `Downloading ${browserName}...`,
      });

      return {
        version: null,
        onProgress: (progress) => {
          onUpdate?.({
            type: "progress",
            stage: "browser-download",
            progress: progress.percent,
          });
        },
      };
    },
  });

  const serveUrl = await getServeUrl({
    isPackaged,
    projectRoot,
    onUpdate,
  });
  const binariesDirectory = getBinariesDirectory({
    isPackaged,
    projectRoot,
  });
  const inputProps = {
    titleText: titleText.trim() || "Hello from Electron",
  };

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
    binariesDirectory,
  });

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
    onProgress(progress) {
      onUpdate?.({
        type: "progress",
        stage: "rendering",
        progress: progress.progress * 100,
      });
    },
  });

  return {outputPath};
};
