// Path rules for the Remotion project that the editor edits. This module is
// shared by the browser (validating new file names) and the server (guarding
// what /api/project may read and write), so it must not use Node.js APIs.

export const PROJECT_DIR = "src/remotion";
export const PROJECT_ENTRY_POINT = `${PROJECT_DIR}/index.ts`;
export const PROJECT_FILE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".json",
];

export const isAllowedProjectPath = (filePath: string): boolean => {
  if (filePath.includes("\\") || filePath.includes("\0")) {
    return false;
  }

  const segments = filePath.split("/");
  const projectSegments = PROJECT_DIR.split("/");
  if (
    segments.length <= projectSegments.length ||
    projectSegments.some((segment, index) => segments[index] !== segment) ||
    segments.some(
      (segment) => segment === "" || segment === "." || segment === "..",
    )
  ) {
    return false;
  }

  const fileName = segments[segments.length - 1];
  const dot = fileName.lastIndexOf(".");
  return dot > 0 && PROJECT_FILE_EXTENSIONS.includes(fileName.slice(dot));
};

/**
 * Turns a file name typed by the user into a project path: relative names
 * are placed inside the project folder and a missing extension defaults to
 * `.tsx`. Returns an error message for paths the server would reject.
 */
export const resolveProjectPathInput = (
  input: string,
): { path: string; error: null } | { path: null; error: string } => {
  let path = input.trim().replace(/^(\.\/)+/, "");
  if (path === "" || path === PROJECT_DIR || path === `${PROJECT_DIR}/`) {
    return { path: null, error: "Enter a file name." };
  }

  const outsideError = {
    path: null,
    error: `Files must be inside ${PROJECT_DIR} and end with ${PROJECT_FILE_EXTENSIONS.join(", ")}.`,
  };
  if (!path.startsWith(`${PROJECT_DIR}/`)) {
    // Absolute paths and paths under another top-level folder are mistakes
    // rather than names to place inside the project.
    if (path.startsWith("/") || path === "src" || path.startsWith("src/")) {
      return outsideError;
    }

    path = `${PROJECT_DIR}/${path}`;
  }

  const fileName = path.split("/").at(-1) ?? "";
  if (!fileName.includes(".")) {
    path = `${path}.tsx`;
  }

  if (!isAllowedProjectPath(path)) {
    return outsideError;
  }

  return { path, error: null };
};
