import { execSync } from "child_process";
import { statSync } from "fs";
import os from "os";

function darwin() {
  return `${process.env.HOME}/Downloads`;
}

function unix() {
  let dir;
  try {
    dir = execSync("xdg-user-dir DOWNLOAD", { encoding: "utf8" }).trim();
  } catch (_) {
    /* empty */
  }

  if (dir && dir !== process.env.HOME) return dir;

  let stat;
  const homeDownloads = `${process.env.HOME}/Downloads`;
  try {
    stat = statSync(homeDownloads);
  } catch (_) {
    /* empty */
  }

  if (stat) return homeDownloads;

  return "/tmp/";
}

function windows() {
  return process.env.USERPROFILE + "/Downloads";
}

export const getDownloadsFolder = () => {
  switch (os.platform()) {
    case "darwin":
      return darwin();
    case "freebsd":
    case "linux":
    case "sunos":
      return unix();
    case "win32":
      return windows();
    default:
      throw new Error("Unsupported platform");
  }
};
