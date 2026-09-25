import {
  getCanvasSequenceNodePathInfo,
  getCanvasSequenceSourceLocation,
  type CanvasSelectionItem,
  type SequenceNodePathInfo,
  type TimelineTrackData,
} from "@remotion/canvas";
import {
  getJsxNodes,
  type CodemodProject,
  type JsxNode,
  type JsxNodeReference,
} from "@remotion/codemods";
import type { SequencePropsSubscriptionKey } from "remotion";

export type Layer = {
  track: TimelineTrackData;
  /** The JSX element in the source code that registers this sequence. */
  source: JsxNode | null;
  nodePathInfo: SequenceNodePathInfo;
  selectionItem: Extract<CanvasSelectionItem, { type: "sequence" }>;
};

const getJsxNodesSafe = (
  project: CodemodProject,
  filePath: string,
  cache: Map<string, JsxNode[]>,
): JsxNode[] => {
  const cached = cache.get(filePath);
  if (cached) {
    return cached;
  }

  let nodes: JsxNode[] = [];
  try {
    nodes = getJsxNodes({ project, filePath });
  } catch {
    // Unknown or unparsable file: the layer stays without a source.
  }

  cache.set(filePath, nodes);
  return nodes;
};

/**
 * Maps the sequences that are mounted in the preview to the JSX elements
 * they were compiled from.
 *
 * The browser bundler records the source location of every JSX element and
 * the Canvas exposes it per track. Looking the location up in the compiled
 * files yields the node path that the codemods operate on. The result is
 * keyed by `overrideId`, which sequences rendered from the same element (for
 * example in a `.map()` loop) share.
 */
export const resolveSequenceNodePaths = (
  tracks: readonly TimelineTrackData[],
  compiledProject: CodemodProject,
): Record<string, SequencePropsSubscriptionKey> => {
  const nodePaths: Record<string, SequencePropsSubscriptionKey> = {};
  const cache = new Map<string, JsxNode[]>();

  for (const track of tracks) {
    const overrideId = track.sequence.controls?.overrideId;
    if (!overrideId || overrideId in nodePaths) {
      continue;
    }

    const location = getCanvasSequenceSourceLocation(track);
    if (!location) {
      continue;
    }

    const candidates = getJsxNodesSafe(
      compiledProject,
      location.fileName,
      cache,
    ).filter((node) => node.location?.line === location.line);
    // Prefer the exact column; several elements on one line are rare.
    const node =
      candidates.find((item) => item.location?.column === location.column) ??
      candidates.at(-1);
    if (!node) {
      continue;
    }

    nodePaths[overrideId] = {
      absolutePath: node.filePath,
      nodePath: node.nodePath,
      sequenceKeys: [],
      effectKeys: [],
      videoConfigValues: track.sequence.controls?.videoConfigValues ?? null,
    };
  }

  return nodePaths;
};

const sameNodePath = (
  a: readonly (string | number)[],
  b: readonly (string | number)[],
) => a.length === b.length && a.every((segment, index) => segment === b[index]);

export const buildLayers = (
  tracks: readonly TimelineTrackData[],
  project: CodemodProject,
): Layer[] => {
  const cache = new Map<string, JsxNode[]>();

  return tracks.map((track): Layer => {
    const nodePathInfo = getCanvasSequenceNodePathInfo(track);
    const key = track.nodePathInfo?.sequenceSubscriptionKey ?? null;
    const source = key
      ? (getJsxNodesSafe(project, key.absolutePath, cache).find((node) =>
          sameNodePath(node.nodePath, key.nodePath),
        ) ?? null)
      : null;

    return {
      track,
      source,
      nodePathInfo,
      selectionItem: { type: "sequence", nodePathInfo },
    };
  });
};

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
