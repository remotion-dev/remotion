import { promises as fs } from "node:fs";
import path from "node:path";

// The Remotion project that is loaded into the editor lives in src/remotion.
// It is a regular Remotion project: `npx remotion studio` and
// `npx remotion render` work on the same files.
export const PROJECT_DIR = "src/remotion";
export const PROJECT_ENTRY_POINT = `${PROJECT_DIR}/index.ts`;

// Keeping the folder literal lets Next.js trace only these files into the
// server bundle instead of the whole project.
const projectRoot = path.join(process.cwd(), "src", "remotion");

const allowedExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".json",
]);

export const isAllowedProjectPath = (filePath: string) => {
  if (filePath.includes("\\") || filePath.includes("\0")) {
    return false;
  }

  const normalized = path.posix.normalize(filePath);
  if (
    normalized !== filePath ||
    !normalized.startsWith(`${PROJECT_DIR}/`) ||
    normalized.split("/").some((segment) => segment === "..")
  ) {
    return false;
  }

  return allowedExtensions.has(path.posix.extname(normalized));
};

const resolveProjectPath = (filePath: string) => {
  if (!isAllowedProjectPath(filePath)) {
    throw new Error(`Refusing to access "${filePath}" outside ${PROJECT_DIR}`);
  }

  return path.join(
    projectRoot,
    ...filePath.slice(PROJECT_DIR.length + 1).split("/"),
  );
};

export const readProjectFiles = async (): Promise<Record<string, string>> => {
  const files: Record<string, string> = {};
  const walk = async (relativeDir: string) => {
    const entries = await fs.readdir(
      path.join(projectRoot, ...relativeDir.split("/").filter(Boolean)),
      { withFileTypes: true },
    );
    for (const entry of entries) {
      const relative = relativeDir
        ? `${relativeDir}/${entry.name}`
        : entry.name;
      if (entry.isDirectory()) {
        await walk(relative);
        continue;
      }

      const filePath = `${PROJECT_DIR}/${relative}`;
      if (isAllowedProjectPath(filePath)) {
        files[filePath] = await fs.readFile(
          resolveProjectPath(filePath),
          "utf8",
        );
      }
    }
  };

  await walk("");
  return files;
};

export const writeProjectFiles = async ({
  files,
  deleted,
}: {
  files: Record<string, string>;
  deleted: string[];
}) => {
  for (const [filePath, contents] of Object.entries(files)) {
    const absolute = resolveProjectPath(filePath);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, contents, "utf8");
  }

  for (const filePath of deleted) {
    await fs.rm(resolveProjectPath(filePath), { force: true });
  }
};
