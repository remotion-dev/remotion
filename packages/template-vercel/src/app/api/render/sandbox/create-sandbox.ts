import { Sandbox } from "@vercel/sandbox";
import {
  createDisposableSandbox,
  getRenderScript,
  OnProgressFn,
} from "../helpers";
import { addBundleToSandbox } from "./add-bundle";
import { installSystemDependencies } from "./install-system-dependencies";
import { installJsDependencies } from "./install-js-dependencies";
import { installBrowser } from "./install-browser";

export async function createSandbox({
  onProgress,
}: {
  onProgress: OnProgressFn;
}): Promise<Sandbox & AsyncDisposable> {
  const sandbox = await createDisposableSandbox({
    runtime: "node24",
    resources: { vcpus: 4 },
    timeout: 5 * 60 * 1000,
  });

  const preparingPhase = "Preparing...";
  const preparingSubtitle = process.env.VERCEL
    ? "This only needs to be done once."
    : "This is only needed during development.";

  // Preparation has 3 stages with weights:
  // - System dependencies: 60%
  // - Copying bundle: 20%
  // - Downloading browser: 20%
  const WEIGHT_SYS_DEPS = 0.6;
  const WEIGHT_BUNDLE = 0.2;
  const WEIGHT_BROWSER = 0.2;

  await onProgress({
    type: "phase",
    phase: preparingPhase,
    subtitle: preparingSubtitle,
    progress: 0,
  });

  // Stage 1: Install system dependencies (60%)
  await installSystemDependencies({
    sandbox,
    onProgress: async (stageProgress: number) => {
      await onProgress({
        type: "phase",
        phase: preparingPhase,
        subtitle: preparingSubtitle,
        progress: stageProgress * WEIGHT_SYS_DEPS,
      });
    },
  });

  await onProgress({
    type: "phase",
    phase: "Adding Remotion video to Sandbox...",
    progress: 0,
    subtitle: preparingSubtitle,
  });

  // Stage 2: Copy Remotion bundle (20%)
  await addBundleToSandbox(sandbox);

  await onProgress({
    type: "phase",
    phase: preparingPhase,
    subtitle: preparingSubtitle,
    progress: WEIGHT_SYS_DEPS + WEIGHT_BUNDLE,
  });

  // Install renderer and blob SDK
  await installJsDependencies({ sandbox });

  // Stage 3: Download browser (20%)
  await installBrowser({
    sandbox,
    onProgress: async (browserProgress: number) => {
      await onProgress({
        type: "phase",
        phase: preparingPhase,
        subtitle: preparingSubtitle,
        progress:
          WEIGHT_SYS_DEPS + WEIGHT_BUNDLE + browserProgress * WEIGHT_BROWSER,
      });
    },
  });

  const renderScript = await getRenderScript();
  await sandbox.writeFiles([
    {
      path: "render.ts",
      content: renderScript,
    },
  ]);

  return sandbox;
}
