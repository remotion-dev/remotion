import {existsSync} from "node:fs";
import {cp, mkdir} from "node:fs/promises";
import path from "node:path";
import {ensureBrowser} from "@remotion/renderer";
import {VitePlugin} from "@electron-forge/plugin-vite";
import {getCompositorPackage} from "./src/compositor-package";
import {getPackagedBrowserPaths} from "./src/packaged-browser";
import {bundleRemotionProject, getPrebuiltRemotionBundlePath} from "./src/remotion-bundle";

const DARWIN_COMPOSITOR_PACKAGES = [
  "@remotion/compositor-darwin-x64",
  "@remotion/compositor-darwin-arm64",
];
const PACKAGE_BROWSER_ENV_VAR = "REMOTION_ELECTRON_PACKAGE_BROWSER";
const shouldPackageBrowser = process.env[PACKAGE_BROWSER_ENV_VAR] === "true";

const DARWIN_UNIVERSAL_ARCH_FILES =
  "Contents/Resources/app.asar.unpacked/node_modules/@remotion/compositor-darwin-*/**";

function getCompositorPackagesForPackaging({
  arch,
  platform,
}: {
  arch: string;
  platform: string;
}): string[] {
  if (platform === "darwin") {
    return DARWIN_COMPOSITOR_PACKAGES;
  }

  return [getCompositorPackage({arch, platform})];
}

function isMissingPackageError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error && "code" in error && error.code === "MODULE_NOT_FOUND"
  );
}

function shouldAllowMissingCompositorPackage({
  arch,
  compositorPackage,
  platform,
}: {
  arch: string;
  compositorPackage: string;
  platform: string;
}): boolean {
  if (platform !== "darwin" || arch === "universal") {
    return false;
  }

  return compositorPackage !== getCompositorPackage({arch, platform});
}

function resolveInstalledCompositorPackageDirectory({
  allowMissing,
  compositorPackage,
}: {
  allowMissing: boolean;
  compositorPackage: string;
}): string | null {
  try {
    const compositorPackageJson = require.resolve(`${compositorPackage}/package.json`, {
      paths: [process.cwd()],
    });

    return path.dirname(compositorPackageJson);
  } catch (error: unknown) {
    if (allowMissing && isMissingPackageError(error)) {
      return null;
    }

    throw error;
  }
}

async function stageCompositorPackages({
  arch,
  buildPath,
  platform,
}: {
  arch: string;
  buildPath: string;
  platform: string;
}): Promise<void> {
  const compositorPackages = getCompositorPackagesForPackaging({
    arch,
    platform,
  });

  for (const compositorPackage of compositorPackages) {
    const compositorSource = resolveInstalledCompositorPackageDirectory({
      allowMissing: shouldAllowMissingCompositorPackage({
        arch,
        compositorPackage,
        platform,
      }),
      compositorPackage,
    });

    if (!compositorSource) {
      continue;
    }

    const compositorDestination = path.join(
      buildPath,
      "node_modules",
      compositorPackage,
    );

    await mkdir(path.dirname(compositorDestination), {recursive: true});
    await cp(compositorSource, compositorDestination, {recursive: true});
  }
}

export async function stageBrowser({
  arch,
  buildPath,
  platform,
}: {
  arch: string;
  buildPath: string;
  platform: string;
}): Promise<void> {
  const browserPaths = getPackagedBrowserPaths({
    arch,
    buildPath,
    platform,
    projectRoot: process.cwd(),
  });

  if (!browserPaths) {
    return;
  }

  await ensureBrowser();
  if (!existsSync(browserPaths.downloadedBrowserFolder)) {
    return;
  }

  if (!browserPaths.packagedBrowserCopyDestination) {
    return;
  }

  await mkdir(path.dirname(browserPaths.packagedBrowserCopyDestination), {
    recursive: true,
  });

  await cp(
    browserPaths.downloadedBrowserFolder,
    browserPaths.packagedBrowserCopyDestination,
    {recursive: true},
  );
}

const config = {
  packagerConfig: {
    asar: {
      unpackDir: shouldPackageBrowser
        ? "{node_modules/@remotion/compositor-*,remotion-browser}"
        : "node_modules/@remotion/compositor-*",
    },
    osxUniversal: {
      // These compositor binaries are already architecture-specific and should not be
      // merged with lipo during universal packaging.
      x64ArchFiles: DARWIN_UNIVERSAL_ARCH_FILES,
    },
  },
  rebuildConfig: {},
  hooks: {
    packageAfterCopy: async (
      _forgeConfig: unknown,
      buildPath: string,
      _electronVersion: string,
      platform: string,
      arch: string,
    ) => {
      await bundleRemotionProject({
        projectRoot: process.cwd(),
        outDir: getPrebuiltRemotionBundlePath(buildPath),
      });

      // Set REMOTION_ELECTRON_PACKAGE_BROWSER=true to package Chrome Headless
      // Shell into the app. This increases the final app size significantly, but
      // packaged renders can run completely offline.
      // IMPORTANT: This is not supported for macOS universal builds.
      // `ensureBrowser()` only downloads a browser for the current architecture,
      // so the other packaged architecture would not get an offline browser.
      // For universal builds, prefer calling `ensureBrowser()` at runtime instead.
      if (shouldPackageBrowser) {
        await stageBrowser({
          arch,
          buildPath,
          platform,
        });
      }

      // Electron Forge's Vite packaging does not materialize this optional runtime binary
      // into the packaged app automatically, so stage the required compositor packages explicitly.
      await stageCompositorPackages({
        arch,
        buildPath,
        platform,
      });
    },
  },
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
};

export default config;
