import {
  getCanvasSequenceNodePathInfo,
  type CanvasSelectionItem,
  type SequenceNodePathInfo,
  type TimelineTrackData,
} from "@remotion/canvas";
import {
  getJsxNodeProps,
  getJsxNodes,
  type CodemodProject,
  type JsxNode,
  type JsxNodeReference,
} from "@remotion/codemods";

/**
 * A JSX element in the source code that registers a sequence at runtime.
 * `name` is the static value of its `name` prop, if any.
 */
export type SourceNode = JsxNode & {
  name: string | null;
  hasNameProp: boolean;
};

export type Layer = {
  track: TimelineTrackData;
  source: SourceNode | null;
  nodePathInfo: SequenceNodePathInfo;
  selectionItem: Extract<CanvasSelectionItem, { type: "sequence" }>;
};

// Elements from `remotion` that show up as a track in the timeline.
const layerTags = new Set([
  "AbsoluteFill",
  "Sequence",
  "Series.Sequence",
  "TransitionSeries.Sequence",
  "Loop",
  "Freeze",
  "Img",
  "Video",
  "OffthreadVideo",
  "Html5Video",
  "Audio",
  "Html5Audio",
  "Solid",
  "Gif",
  "AnimatedImage",
  "Lottie",
  "ThreeCanvas",
]);

export const isLayerTag = (tagName: string) =>
  layerTags.has(tagName) || tagName.startsWith("Interactive.");

// Elements register default names like "<AbsoluteFill>" when no `name` is set.
const getDefaultNameTags = (track: TimelineTrackData): string[] => {
  const { displayName, type } = track.sequence;
  if (type === "video") {
    return ["Video", "OffthreadVideo", "Html5Video"];
  }

  if (type === "audio") {
    return ["Audio", "Html5Audio"];
  }

  if (type === "image") {
    return ["Img", "Gif", "AnimatedImage"];
  }

  if (displayName.startsWith("<") && displayName.endsWith(">")) {
    return [displayName.slice(1, -1)];
  }

  if (displayName === "") {
    return ["Sequence", "Series.Sequence", "TransitionSeries.Sequence"];
  }

  return [];
};

const hasCustomName = (track: TimelineTrackData) => {
  const { displayName } = track.sequence;
  return (
    displayName !== "" &&
    !(displayName.startsWith("<") && displayName.endsWith(">"))
  );
};

export const collectSourceNodes = (
  project: CodemodProject,
  mainFile: string | null,
): SourceNode[] => {
  const filePaths = Object.keys(project.files)
    .filter((filePath) => /\.(tsx|jsx)$/.test(filePath))
    .sort((a, b) => {
      if (a === mainFile) return -1;
      if (b === mainFile) return 1;
      return a.localeCompare(b);
    });

  const nodes: SourceNode[] = [];
  for (const filePath of filePaths) {
    let jsxNodes: JsxNode[];
    try {
      jsxNodes = getJsxNodes({ project, filePath });
    } catch {
      continue;
    }

    for (const node of jsxNodes) {
      if (!isLayerTag(node.tagName)) {
        continue;
      }

      let name: string | null = null;
      let hasNameProp = false;
      try {
        const status = getJsxNodeProps({ project, node, keys: ["name"] }).props
          .name;
        if (status?.status === "static") {
          hasNameProp = status.codeValue !== undefined;
          name = typeof status.codeValue === "string" ? status.codeValue : null;
        } else if (status) {
          hasNameProp = true;
        }
      } catch {
        // Keep the node without a name.
      }

      nodes.push({ ...node, name, hasNameProp });
    }
  }

  return nodes;
};

/**
 * Matches the sequences that are mounted in the preview to JSX elements in
 * the source code.
 *
 * The Canvas does not know where a sequence was written, so the editor
 * matches them heuristically: first by the `name` prop, then by element type
 * in source order. Give your layers unique names to make the mapping robust.
 */
export const mapTracksToSources = (
  tracks: readonly TimelineTrackData[],
  nodes: readonly SourceNode[],
  mainFile: string | null,
): Map<string, SourceNode | null> => {
  const mapping = new Map<string, SourceNode | null>();
  const used = new Set<SourceNode>();
  // Elements rendered in a loop (e.g. `items.map()`) register several sibling
  // sequences for a single JSX node. Remember the last match per parent so
  // the siblings can share it.
  const lastMatchByParent = new Map<string | null, SourceNode>();

  const orderByFile = (candidates: SourceNode[]) => [
    ...candidates.filter((node) => node.filePath === mainFile),
    ...candidates.filter((node) => node.filePath !== mainFile),
  ];

  for (const track of tracks) {
    const { displayName } = track.sequence;
    // Siblings of a loop live under parents that map to the same JSX node.
    const parentSource = track.sequence.parent
      ? mapping.get(track.sequence.parent)
      : null;
    const parent = parentSource
      ? getSourceKey(parentSource)
      : track.sequence.parent;
    let match: SourceNode | null = null;

    if (hasCustomName(track)) {
      const sameName = orderByFile(
        nodes.filter((node) => node.name === displayName),
      );
      match = sameName.find((node) => !used.has(node)) ?? sameName[0] ?? null;
    }

    if (!match) {
      const tags = getDefaultNameTags(track);
      const candidates = orderByFile(
        tags.length > 0
          ? nodes.filter(
              (node) => tags.includes(node.tagName) && node.name === null,
            )
          : nodes.filter((node) => node.hasNameProp && node.name === null),
      );
      match = candidates.find((node) => !used.has(node)) ?? null;
      if (!match) {
        const previous = lastMatchByParent.get(parent);
        if (previous && candidates.includes(previous)) {
          match = previous;
        }
      }
    }

    if (match) {
      used.add(match);
      lastMatchByParent.set(parent, match);
    }

    mapping.set(track.sequence.id, match);
  }

  return mapping;
};

export const buildLayers = (
  tracks: readonly TimelineTrackData[],
  mapping: Map<string, SourceNode | null>,
): Layer[] => {
  const occurrences = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const track of tracks) {
    const source = mapping.get(track.sequence.id);
    if (source) {
      const key = getSourceKey(source);
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }
  }

  return tracks.map((track): Layer => {
    const source = mapping.get(track.sequence.id) ?? null;
    let nodePathInfo: SequenceNodePathInfo;
    if (source) {
      const key = getSourceKey(source);
      const index = occurrences.get(key) ?? 0;
      occurrences.set(key, index + 1);
      nodePathInfo = {
        sequenceSubscriptionKey: {
          absolutePath: source.filePath,
          nodePath: source.nodePath,
          sequenceKeys: [],
          effectKeys: [],
          videoConfigValues: null,
        },
        auxiliaryKeys: [],
        index,
        numberOfSequencesWithThisNodePath: totals.get(key) ?? 1,
        supportsEffects: false,
      };
    } else {
      nodePathInfo = getCanvasSequenceNodePathInfo(track);
    }

    return {
      track,
      source,
      nodePathInfo,
      selectionItem: { type: "sequence", nodePathInfo },
    };
  });
};

export const getSourceKey = (node: JsxNodeReference) =>
  `${node.filePath}:${JSON.stringify(node.nodePath)}`;

export const getNodeReference = (
  item: CanvasSelectionItem,
): JsxNodeReference | null => {
  if (item.type === "guide") {
    return null;
  }

  const { absolutePath, nodePath } = item.nodePathInfo.sequenceSubscriptionKey;
  if (absolutePath === "remotion-canvas") {
    return null;
  }

  return { filePath: absolutePath, nodePath };
};

/** Two JSX elements that are children of the same parent element. */
export const areSiblingNodes = (a: JsxNodeReference, b: JsxNodeReference) => {
  if (a.filePath !== b.filePath || a.nodePath.length !== b.nodePath.length) {
    return false;
  }

  const length = a.nodePath.length;
  if (
    length < 3 ||
    a.nodePath[length - 1] !== "openingElement" ||
    a.nodePath[length - 3] !== "children"
  ) {
    return false;
  }

  return a.nodePath
    .slice(0, -2)
    .every((segment, index) => segment === b.nodePath[index]);
};

export const getLayerLabel = (layer: Layer) => {
  const { displayName, type } = layer.track.sequence;
  if (displayName === "") {
    return layer.source?.tagName ?? (type === "sequence" ? "Sequence" : type);
  }

  return displayName;
};
