import type { CodemodProject } from "@remotion/codemods";
import type { VirtualProject } from "@remotion/browser-bundler";

export type ProjectFiles = Record<string, string>;

export const toCodemodProject = (files: ProjectFiles): CodemodProject => ({
  files,
  rootDir: "/",
});

export const toVirtualProject = (
  files: ProjectFiles,
  entryPoint: string,
): VirtualProject => ({
  entryPoint,
  files,
});

export const getFileName = (filePath: string) =>
  filePath.split("/").at(-1) ?? filePath;

export const getFileExtension = (filePath: string) =>
  filePath.includes(".") ? (filePath.split(".").at(-1) ?? "") : "";

export const sortFilePaths = (paths: readonly string[]) =>
  [...paths].sort((a, b) => {
    const depthDifference = a.split("/").length - b.split("/").length;
    return depthDifference !== 0 ? depthDifference : a.localeCompare(b);
  });

export const filesAreEqual = (a: ProjectFiles, b: ProjectFiles) => {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }

  return aKeys.every((key) => a[key] === b[key]);
};

export const getMonacoLanguage = (filePath: string) => {
  switch (getFileExtension(filePath)) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "css":
      return "css";
    case "json":
      return "json";
    default:
      return "plaintext";
  }
};
