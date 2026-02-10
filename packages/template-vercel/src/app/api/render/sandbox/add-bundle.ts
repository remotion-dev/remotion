import path from "path";
import { BUILD_DIR } from "../../../../../build-dir.mjs";
import { Sandbox } from "@vercel/sandbox";
import { readdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { execSync } from "child_process";

export const addBundleToSandbox = async (
  sandbox: Sandbox & AsyncDisposable,
) => {
  await ensureLocalBundle();
  const bundleFiles = await getRemotionBundleFiles();

  const dirs = new Set<string>();
  for (const file of bundleFiles) {
    const dir = path.dirname(file.path);
    if (dir && dir !== ".") {
      dirs.add(dir);
    }
  }

  for (const dir of Array.from(dirs).sort()) {
    await sandbox.mkDir(BUILD_DIR + "/" + dir);
  }

  await sandbox.writeFiles(
    bundleFiles.map((file) => ({
      path: BUILD_DIR + "/" + file.path,
      content: file.content,
    })),
  );
};

async function getRemotionBundleFiles(): Promise<
  { path: string; content: Buffer }[]
> {
  const bundleDir = path.join(process.cwd(), BUILD_DIR);

  const remotionDir = bundleDir;

  const files: { path: string; content: Buffer }[] = [];

  async function readDirRecursive(dir: string, basePath: string = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      if (entry.isDirectory()) {
        await readDirRecursive(fullPath, relativePath);
      } else {
        const content = await readFile(fullPath);
        files.push({ path: relativePath, content });
      }
    }
  }

  await readDirRecursive(remotionDir);
  return files;
}

async function ensureLocalBundle(): Promise<void> {
  if (process.env.VERCEL) {
    return;
  }

  const bundleDir = path.join(process.cwd(), BUILD_DIR);
  if (!existsSync(bundleDir)) {
    try {
      execSync(`node_modules/.bin/remotion bundle --out-dir ./${BUILD_DIR}`, {
        cwd: process.cwd(),
        stdio: "pipe",
      });
    } catch (e) {
      const stderr = (e as { stderr?: Buffer }).stderr?.toString() ?? "";
      throw new Error(`Remotion bundle failed: ${stderr}`);
    }
  }
}
