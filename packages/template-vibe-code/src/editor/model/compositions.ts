import {
  getNodeProps,
  getNodes,
  type CodemodProject,
  type NodeReference,
} from "@remotion/codemods";

export type CompositionInfo = {
  id: string;
  tagName: "Composition" | "Still";
  filePath: string;
  node: NodeReference;
  line: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  durationInFrames: number | null;
  defaultProps: Record<string, unknown> | null;
};

const compositionTags = new Set(["Composition", "Still"]);

const readStatic = <T>(
  props: ReturnType<typeof getNodeProps>["props"],
  key: string,
  guard: (value: unknown) => value is T,
): T | null => {
  const status = props[key];
  if (!status || status.status !== "static") {
    return null;
  }

  return guard(status.codeValue) ? status.codeValue : null;
};

const isString = (value: unknown): value is string => typeof value === "string";
const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Finds the file that registers <Composition> elements. This is where
 * composition codemods (rename, duplicate, metadata) are applied.
 */
export const findCompositionFile = (project: CodemodProject): string | null => {
  const candidates = Object.keys(project.files)
    .filter((filePath) => /\.(tsx|jsx)$/.test(filePath))
    .sort((a, b) => {
      const aIsRoot = /Root\.(tsx|jsx)$/.test(a) ? 0 : 1;
      const bIsRoot = /Root\.(tsx|jsx)$/.test(b) ? 0 : 1;
      return aIsRoot - bIsRoot || a.localeCompare(b);
    });

  for (const filePath of candidates) {
    if (!/<(Composition|Still)[\s>/]/.test(project.files[filePath])) {
      continue;
    }

    try {
      if (
        getNodes({ project, filePath }).some((node) =>
          compositionTags.has(node.tagName),
        )
      ) {
        return filePath;
      }
    } catch {
      // Unparseable file, keep looking.
    }
  }

  return null;
};

export const getCompositions = (
  project: CodemodProject,
  compositionFile: string | null,
): CompositionInfo[] => {
  if (!compositionFile) {
    return [];
  }

  try {
    return getNodes({ project, filePath: compositionFile })
      .filter((node) => compositionTags.has(node.tagName))
      .flatMap((node): CompositionInfo[] => {
        const { props } = getNodeProps({
          project,
          node,
          keys: [
            "id",
            "width",
            "height",
            "fps",
            "durationInFrames",
            "defaultProps",
          ],
        });
        const id = readStatic(props, "id", isString);
        if (!id) {
          return [];
        }

        return [
          {
            id,
            tagName: node.tagName as "Composition" | "Still",
            filePath: node.filePath,
            node: { filePath: node.filePath, nodePath: node.nodePath },
            line: node.location?.line ?? null,
            width: readStatic(props, "width", isNumber),
            height: readStatic(props, "height", isNumber),
            fps: readStatic(props, "fps", isNumber),
            durationInFrames: readStatic(props, "durationInFrames", isNumber),
            defaultProps: readStatic(props, "defaultProps", isRecord),
          },
        ];
      });
  } catch {
    return [];
  }
};
