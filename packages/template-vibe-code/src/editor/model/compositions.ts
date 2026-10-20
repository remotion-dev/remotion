import {
  getNodeProps,
  getNodes,
  type CodemodProject,
  type CompositionTreeItem,
  type FolderReference,
  type NodeReference,
} from "@remotion/codemods";

export type CompositionInfo = {
  id: string;
  tagName: "Composition" | "Still";
  filePath: string;
  node: NodeReference;
  line: number | null;
  /** The enclosing folders as a slash-separated path, `null` at the root. */
  folderPath: string | null;
  /**
   * Whether the element is written directly inside another element or
   * fragment. `moveComposition()` and `moveFolder()` can only move and target
   * such elements, not ones returned from a function or a `.map()` callback.
   */
  movable: boolean;
  width: number | null;
  height: number | null;
  fps: number | null;
  durationInFrames: number | null;
  defaultProps: Record<string, unknown> | null;
};

export type FolderInfo = FolderReference & {
  filePath: string;
  node: NodeReference;
  line: number | null;
  /** See `CompositionInfo.movable`. */
  movable: boolean;
};

export type RegistrationTreeItem =
  | { type: "composition"; composition: CompositionInfo }
  | { type: "folder"; folder: FolderInfo; children: RegistrationTreeItem[] };

/** The <Composition>, <Still> and <Folder> elements of the registration file. */
export type Registrations = {
  compositions: CompositionInfo[];
  folders: FolderInfo[];
  tree: RegistrationTreeItem[];
};

const emptyRegistrations: Registrations = {
  compositions: [],
  folders: [],
  tree: [],
};

const registrationIdentities = {
  "dev.remotion.remotion.Composition": "Composition",
  "dev.remotion.remotion.Still": "Still",
} as const;

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

/** The folder path the codemods use as `parentName` for the folder's children. */
export const getFolderPath = (folder: FolderReference): string =>
  folder.parentName === null
    ? folder.name
    : `${folder.parentName}/${folder.name}`;

export const toFolderReference = (folderPath: string): FolderReference => {
  const segments = folderPath.split("/");
  return {
    name: segments[segments.length - 1],
    parentName: segments.slice(0, -1).join("/") || null,
  };
};

/** The tree item the codemods address a registration by. */
export const toCompositionTreeItem = (
  item: RegistrationTreeItem,
): CompositionTreeItem =>
  item.type === "composition"
    ? { type: "composition", compositionId: item.composition.id }
    : {
        type: "folder",
        name: item.folder.name,
        parentName: item.folder.parentName,
      };

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
        getNodes({ project, filePath }).some(
          (node) =>
            node.componentIdentity !== null &&
            node.componentIdentity in registrationIdentities,
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

/**
 * Reads the registration tree in source order. Compositions and folders are
 * attached to their closest enclosing <Folder>; other wrapper elements are
 * skipped.
 */
export const getRegistrations = (
  project: CodemodProject,
  compositionFile: string | null,
): Registrations => {
  if (!compositionFile) {
    return emptyRegistrations;
  }

  try {
    const nodes = getNodes({ project, filePath: compositionFile });
    const nodesByPath = new Map(
      nodes.map((node) => [JSON.stringify(node.nodePath), node]),
    );
    const foldersByPath = new Map<
      string,
      Extract<RegistrationTreeItem, { type: "folder" }>
    >();
    const registrations: Registrations = {
      compositions: [],
      folders: [],
      tree: [],
    };

    for (const node of nodes) {
      const tagName =
        node.componentIdentity !== null &&
        node.componentIdentity in registrationIdentities
          ? registrationIdentities[
              node.componentIdentity as keyof typeof registrationIdentities
            ]
          : node.componentIdentity === "dev.remotion.remotion.Folder"
            ? "Folder"
            : null;
      if (tagName === null) {
        continue;
      }

      let parentPath = node.parentNodePath;
      let parent: Extract<RegistrationTreeItem, { type: "folder" }> | null =
        null;
      while (parentPath !== null && parent === null) {
        const key = JSON.stringify(parentPath);
        parent = foldersByPath.get(key) ?? null;
        parentPath = nodesByPath.get(key)?.parentNodePath ?? null;
      }

      const children = parent?.children ?? registrations.tree;
      const folderPath = parent ? getFolderPath(parent.folder) : null;
      const reference = { filePath: node.filePath, nodePath: node.nodePath };
      // A JSX child's path ends in [..., "children", index, "openingElement"].
      const movable = node.nodePath.at(-3) === "children";
      if (tagName === "Folder") {
        const { props } = getNodeProps({ project, node, keys: ["name"] });
        const name = readStatic(props, "name", isString);
        if (!name) {
          continue;
        }

        const folder: FolderInfo = {
          name,
          parentName: folderPath,
          filePath: node.filePath,
          node: reference,
          line: node.location?.line ?? null,
          movable,
        };
        const item = { type: "folder" as const, folder, children: [] };
        foldersByPath.set(JSON.stringify(node.nodePath), item);
        registrations.folders.push(folder);
        children.push(item);
        continue;
      }

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
        continue;
      }

      const composition: CompositionInfo = {
        id,
        tagName,
        filePath: node.filePath,
        node: reference,
        line: node.location?.line ?? null,
        folderPath,
        movable,
        width: readStatic(props, "width", isNumber),
        height: readStatic(props, "height", isNumber),
        fps: readStatic(props, "fps", isNumber),
        durationInFrames: readStatic(props, "durationInFrames", isNumber),
        defaultProps: readStatic(props, "defaultProps", isRecord),
      };
      registrations.compositions.push(composition);
      children.push({ type: "composition", composition });
    }

    return registrations;
  } catch {
    return emptyRegistrations;
  }
};
