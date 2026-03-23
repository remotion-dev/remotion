import {existsSync} from "node:fs";
import {rm} from "node:fs/promises";
import path from "node:path";
import type {BundleOptions} from "@remotion/bundler";
import type {RenderUpdate} from "./electron-api";

export const PREBUILT_REMOTION_BUNDLE_DIR = "remotion-bundle";
type BundleProgress = Parameters<NonNullable<BundleOptions["onProgress"]>>[0];

export const getPrebuiltRemotionBundlePath = (projectRoot: string) => {
  return path.join(projectRoot, PREBUILT_REMOTION_BUNDLE_DIR);
};

export const hasPrebuiltRemotionBundle = (projectRoot: string) => {
  return existsSync(getPrebuiltRemotionBundlePath(projectRoot));
};

export const bundleRemotionProject = async ({
  projectRoot,
  outDir,
  onUpdate,
}: {
  projectRoot: string;
  outDir?: string;
  onUpdate?: (update: RenderUpdate) => void;
}) => {
  const {bundle} = await import("@remotion/bundler");

  if (outDir) {
    await rm(outDir, {recursive: true, force: true});
  }

  return bundle({
    entryPoint: path.join(projectRoot, "remotion/index.ts"),
    outDir,
    onProgress(progress: BundleProgress) {
      onUpdate?.({
        type: "progress",
        stage: "bundling",
        progress,
      });
    },
  });
};
