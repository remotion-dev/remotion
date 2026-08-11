import {existsSync} from "node:fs";
import path from "node:path";

export const PACKAGED_BROWSER_DIR = "remotion-browser";

type BrowserLayout = {
  platformDir: string;
  executableName: string;
};

type PackagedBrowserPaths = {
  downloadedBrowserFolder: string;
  packagedBrowserCopyDestination: string | null;
  packagedBrowserExecutablePath: string | null;
};

function getBrowserLayout({
  arch,
  platform,
}: {
  arch: string;
  platform: string;
}): BrowserLayout | null {
  switch (platform) {
    case "darwin":
      if (arch === "arm64") {
        return {
          platformDir: "mac-arm64",
          executableName: "chrome-headless-shell",
        };
      }

      if (arch === "x64") {
        return {
          platformDir: "mac-x64",
          executableName: "chrome-headless-shell",
        };
      }

      return null;
    case "linux":
      if (arch === "arm64") {
        return {
          platformDir: "linux-arm64",
          executableName: "headless_shell",
        };
      }

      if (arch === "x64") {
        return {
          platformDir: "linux64",
          executableName: "chrome-headless-shell",
        };
      }

      return null;
    case "win32":
      if (arch === "x64") {
        return {
          platformDir: "win64",
          executableName: "chrome-headless-shell.exe",
        };
      }

      return null;
    default:
      return null;
  }
}

export function getPackagedBrowserPaths({
  arch,
  buildPath,
  platform,
  projectRoot,
}: {
  arch: string;
  buildPath?: string;
  platform: string;
  projectRoot: string;
}): PackagedBrowserPaths | null {
  const browserLayout = getBrowserLayout({arch, platform});

  if (!browserLayout) {
    return null;
  }

  const downloadedBrowserFolder = path.join(
    projectRoot,
    "node_modules",
    ".remotion",
    "chrome-headless-shell",
    browserLayout.platformDir,
  );
  
  const packagedBrowserCopyDestination = buildPath
    ? path.join(buildPath, PACKAGED_BROWSER_DIR, browserLayout.platformDir)
    : null;

  const packagedBrowserExecutablePath = path.join(
    path.dirname(projectRoot),
    "app.asar.unpacked",
    PACKAGED_BROWSER_DIR,
    browserLayout.platformDir,
    `chrome-headless-shell-${browserLayout.platformDir}`,
    browserLayout.executableName,
  );

  return {
    downloadedBrowserFolder,
    packagedBrowserCopyDestination,
    packagedBrowserExecutablePath: existsSync(packagedBrowserExecutablePath)
      ? packagedBrowserExecutablePath
      : null,
  };
}
