"use client";

import type {
  CanvasSequenceNodePathResolver,
  TimelineTrackData,
} from "@remotion/canvas";
import type { CodemodProject } from "@remotion/codemods";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { PreviewHost } from "@/preview/bridge";
import {
  buildLayers,
  collectSourceNodes,
  mapTracksToSources,
  type Layer,
  type SourceNode,
} from "../model/layers";

const emptyTracks: readonly TimelineTrackData[] = [];
const noopSubscribe = () => () => {};

/**
 * Both the layer list in the editor and the selection outlines in the Canvas
 * need to agree on the identity of every layer. Computing the layers from
 * the same (tracks, source nodes) pair through a single memoized function
 * guarantees they match, even though the Canvas asks for identities from
 * inside the iframe.
 */
const createLayerCache = () => {
  let cachedTracks: readonly TimelineTrackData[] | null = null;
  let cachedNodes: readonly SourceNode[] | null = null;
  let cachedMainFile: string | null = null;
  let cachedLayers: Layer[] = [];

  return (
    tracks: readonly TimelineTrackData[],
    nodes: readonly SourceNode[],
    mainFile: string | null,
  ): Layer[] => {
    if (
      cachedTracks === tracks &&
      cachedNodes === nodes &&
      cachedMainFile === mainFile
    ) {
      return cachedLayers;
    }

    cachedTracks = tracks;
    cachedNodes = nodes;
    cachedMainFile = mainFile;
    cachedLayers = buildLayers(
      tracks,
      mapTracksToSources(tracks, nodes, mainFile),
    );
    return cachedLayers;
  };
};

export const useLayers = ({
  host,
  project,
  mainFile,
}: {
  host: PreviewHost | null;
  project: CodemodProject;
  mainFile: string | null;
}): Layer[] => {
  const getLayers = useMemo(createLayerCache, []);
  const tracks = useSyncExternalStore(
    host?.controller.timeline.subscribe ?? noopSubscribe,
    () => host?.controller.timeline.getSnapshot() ?? emptyTracks,
    () => emptyTracks,
  );
  const sourceNodes = useMemo(
    () => collectSourceNodes(project, mainFile),
    [mainFile, project],
  );
  const latest = useRef({ sourceNodes, mainFile });
  latest.current = { sourceNodes, mainFile };

  useEffect(() => {
    if (!host) {
      return;
    }

    const resolve: CanvasSequenceNodePathResolver = (track) => {
      const layers = getLayers(
        host.controller.timeline.getSnapshot(),
        latest.current.sourceNodes,
        latest.current.mainFile,
      );
      return (
        layers.find((layer) => layer.track.sequence.id === track.sequence.id)
          ?.nodePathInfo ?? null
      );
    };
    host.setOptions({ resolveSequenceNodePathInfo: resolve });
    return () => host.setOptions({ resolveSequenceNodePathInfo: null });
  }, [getLayers, host]);

  return useMemo(
    () => getLayers(tracks, sourceNodes, mainFile),
    [getLayers, mainFile, sourceNodes, tracks],
  );
};
