"use client";

import type { TimelineTrackData } from "@remotion/canvas";
import type { CodemodProject } from "@remotion/codemods";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { PreviewHost } from "@/preview/bridge";
import {
  buildLayers,
  resolveSequenceNodePaths,
  type Layer,
} from "../model/layers";

const emptyTracks: readonly TimelineTrackData[] = [];
const noopSubscribe = () => () => {};

/**
 * Registers the source node of every mounted sequence with the Canvas and
 * derives the layer list from the resulting timeline.
 *
 * The source locations reported by the preview refer to the files that were
 * compiled last, so everything is resolved against `compiledProject`. While
 * an edit is being compiled, the layers keep describing what the preview
 * shows; they catch up as soon as the new bundle is running.
 */
export const useLayers = ({
  host,
  compiledProject,
}: {
  host: PreviewHost | null;
  compiledProject: CodemodProject;
}): Layer[] => {
  const tracks = useSyncExternalStore(
    host?.controller.timeline.subscribe ?? noopSubscribe,
    () => host?.controller.timeline.getSnapshot() ?? emptyTracks,
    () => emptyTracks,
  );

  useEffect(() => {
    if (!host) {
      return;
    }

    // Registering node paths republishes the timeline. The Canvas ignores an
    // unchanged mapping, so the resulting update does not loop.
    host.controller.setSequenceNodePaths(
      resolveSequenceNodePaths(tracks, compiledProject),
    );
  }, [compiledProject, host, tracks]);

  return useMemo(
    () => buildLayers(tracks, compiledProject),
    [compiledProject, tracks],
  );
};
