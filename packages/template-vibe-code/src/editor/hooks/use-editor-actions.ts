"use client";

import {
  getCanvasKeyframeChangeOverride,
  getCanvasKeyframeToggle,
  getCanvasSelectionItemKey,
  getCanvasSequenceReorderSelection,
  type CanvasKeyframeChange,
  type CanvasKeyframeEasing,
  type CanvasSelectionInteraction,
  type CanvasSequencePropChange,
  type SequenceNodePathInfo,
} from "@remotion/sdk";
import {
  addComposition,
  addElement,
  addFolder,
  applyCodemodChanges,
  createElement,
  deleteComposition,
  deleteNodes as deleteNodesCodemod,
  duplicateComposition,
  duplicateNodes as duplicateNodesCodemod,
  moveComposition,
  moveFolder,
  renameComposition,
  renameFolder,
  reorderNodes as reorderNodesCodemod,
  resolveCompositionComponent,
  setCompositionDefaultProps,
  splitSequences,
  unwrapFolder,
  updateCompositionMetadata,
  updateMultipleNodeProps,
  updateNodeKeyframes,
  updateNodeProps,
  wrapNode,
  type CodemodElement,
  type CodemodNodeResult,
  type CodemodProject,
  type CodemodResult,
  type CodemodValue,
  type CompositionDestination,
  type CompositionMetadata,
  type CompositionTreeItem,
  type FolderReference,
  type NodeKeyframeUpdate,
  type NodePathRemapping,
  type NodePropChange,
  type NodeReference,
  type SequencePropUpdate,
} from "@remotion/codemods";
import { useMemo, useRef } from "react";
import type {
  CanUpdateSequencePropStatus,
  InteractivitySchema,
} from "remotion";
import type {
  PreviewHost,
  PreviewRenderRequest,
  PreviewZoom,
} from "@/preview/bridge";
import type { CompositionInfo } from "../model/compositions";
import { formatSource } from "../model/format";
import {
  findKeyframedProp,
  getEasingChanges,
  getEasingSelectionItem,
  getKeyframeSelectionItem,
  getSelectedKeyframes,
  type EasingSelectionItem,
  type KeyframedProp,
  type KeyframeSelectionItem,
} from "../model/keyframes";
import {
  areSiblingNodes,
  chainNodePathRemappings,
  getNodeReference,
  type Layer,
} from "../model/layers";
import { filesAreEqual, getFileName, toCodemodProject } from "../model/project";
import { BASE_PATH } from "@/lib/base-path";
import { resolveProjectPathInput } from "@/lib/project-paths";
import type { PlaybackStore } from "./use-playback";
import { getErrorMessage } from "./use-preview-host";
import type {
  EditorAction,
  EditorState,
  RenderJob,
} from "../state/editor-store";

const zoomLevels = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

type ActionContext = {
  state: EditorState;
  entryPoint: string;
  host: PreviewHost | null;
  layers: Layer[];
  keyframedProps: KeyframedProp[];
  compositions: CompositionInfo[];
  compositionFile: string | null;
  activeComposition: CompositionInfo | null;
  compositionDurationInFrames: number;
  compositionFps: number;
  compositionWidth: number;
  compositionHeight: number;
};

export const useEditorActions = ({
  context,
  dispatch,
  playback,
  canSave,
}: {
  context: ActionContext;
  dispatch: React.Dispatch<EditorAction>;
  playback: PlaybackStore;
  canSave: boolean;
}) => {
  // Actions read the latest state through a ref so their identities stay
  // stable for keyboard shortcuts and memoized components.
  const ref = useRef(context);
  ref.current = context;

  return useMemo(() => {
    const notifyError = (error: unknown) => {
      dispatch({
        type: "notify",
        notice: { type: "error", message: getErrorMessage(error) },
      });
    };

    const notify = (message: string) => {
      dispatch({ type: "notify", notice: { type: "info", message } });
    };

    const getProject = () => toCodemodProject(ref.current.state.files);

    /**
     * Applies a codemod as one undoable edit. Node-path remappings of the
     * result are handed to the Canvas, which applies them together with the
     * Fast Refresh update of the compiled source, so the selection and the
     * layer list keep pointing at the same elements.
     */
    const applyCodemod = async (
      run: (
        project: CodemodProject,
      ) =>
        | Promise<CodemodResult | CodemodNodeResult>
        | CodemodResult
        | CodemodNodeResult,
      {
        onApplied,
      }: {
        onApplied?: (changed: boolean) => void;
      } = {},
    ) => {
      try {
        const project = getProject();
        const result = await run(project);
        const next = applyCodemodChanges(project, result.changes);
        const files = { ...next.files };
        for (const change of result.changes) {
          if (change.nextContents !== null && change.filePath in files) {
            files[change.filePath] = await formatSource(
              change.filePath,
              files[change.filePath],
            );
          }
        }

        const changed = !filesAreEqual(project.files, files);
        dispatch({ type: "set-files", files, coalesceKey: null });
        if (changed && "nodePathRemappings" in result) {
          ref.current.host?.controller.queueSequenceNodePathRemappings(
            result.nodePathRemappings,
          );
        }

        onApplied?.(changed);
        return true;
      } catch (error) {
        notifyError(error);
        return false;
      }
    };

    // Values previewed on the canvas through overrides. They stay in place
    // until the preview has compiled the committed source, so the canvas does
    // not flash the old value while the bundler works.
    const pendingPreviews = new Map<string, SequenceNodePathInfo>();
    const clearPreview = (layer: Layer) => {
      pendingPreviews.delete(getCanvasSelectionItemKey(layer.selectionItem));
      ref.current.host?.controller.overrides.clear(layer.nodePathInfo);
    };

    const getPlayer = () => playback.getPlayer();

    const seek = (frame: number) => {
      const { compositionDurationInFrames } = ref.current;
      const clamped = Math.max(
        0,
        Math.min(compositionDurationInFrames - 1, Math.round(frame)),
      );
      getPlayer()?.seekTo(clamped);
    };

    const requireComposition = () => {
      const { activeComposition, compositionFile } = ref.current;
      if (!activeComposition || !compositionFile) {
        throw new Error("Select a composition first.");
      }

      return { activeComposition, compositionFile };
    };

    const currentFrame = () => playback.getSnapshot().frame;

    // Adds an element to the active composition, starting at the playhead.
    // Element creation validates its input, so it happens inside the guard.
    const addElementAtPlayhead = (getElement: () => CodemodElement) => {
      try {
        const { activeComposition, compositionFile } = requireComposition();
        const sequence = createElement({
          component: "Sequence",
          importPath: "remotion",
          props: { from: currentFrame() },
          children: [getElement()],
        });
        return applyCodemod((project) =>
          addElement({
            project,
            element: sequence,
            target: {
              type: "composition",
              compositionFile,
              compositionId: activeComposition.id,
            },
          }),
        );
      } catch (error) {
        notifyError(error);
        return Promise.resolve(false);
      }
    };

    type NodeChange = {
      node: NodeReference;
      nodePathInfo: SequenceNodePathInfo;
      schema: InteractivitySchema;
      updates: SequencePropUpdate[];
      keyframes: NodeKeyframeUpdate[];
    };

    // Groups the props and keyframes of a canvas gesture by source node, so
    // each node is rewritten once.
    const groupNodeChanges = (
      changes: readonly (CanvasSequencePropChange | CanvasKeyframeChange)[],
    ) => {
      const controller = ref.current.host?.controller;
      const nodeChanges = new Map<string, NodeChange>();
      for (const change of changes) {
        const item = {
          type: "sequence" as const,
          nodePathInfo: change.nodePathInfo,
        };
        const node = getNodeReference(item);
        if (!node) {
          controller?.overrides.clear(change.nodePathInfo);
          continue;
        }

        const key = getCanvasSelectionItemKey(item);
        const nodeChange = nodeChanges.get(key) ?? {
          node,
          nodePathInfo: change.nodePathInfo,
          schema: change.schema,
          updates: [],
          keyframes: [],
        };
        nodeChanges.set(key, nodeChange);
        if ("operation" in change) {
          nodeChange.keyframes.push({
            key: change.key,
            operation: change.operation,
          });
        } else if (change.type === "keyframe") {
          nodeChange.keyframes.push({
            key: change.key,
            operation: {
              type: "add",
              frame: change.frame,
              value: change.value,
            },
          });
        } else {
          nodeChange.updates.push({
            key: change.key,
            value: change.value,
            defaultValue: change.defaultValue,
          });
        }
      }

      return nodeChanges;
    };

    /**
     * Writes grouped node changes to the source in one undoable step. The
     * canvas keeps previewing the values until `releasePreviews`.
     */
    const commitNodeChanges = async (nodeChanges: Map<string, NodeChange>) => {
      if (nodeChanges.size === 0) {
        return false;
      }

      const controller = ref.current.host?.controller;
      const videoConfig = {
        width: ref.current.compositionWidth,
        height: ref.current.compositionHeight,
        fps: ref.current.compositionFps,
        durationInFrames: ref.current.compositionDurationInFrames,
      };
      const release = () => {
        for (const { nodePathInfo } of nodeChanges.values()) {
          pendingPreviews.delete(
            getCanvasSelectionItemKey({ type: "sequence", nodePathInfo }),
          );
          controller?.overrides.clear(nodePathInfo);
        }
      };

      for (const [key, { nodePathInfo }] of nodeChanges) {
        pendingPreviews.set(key, nodePathInfo);
      }

      const ok = await applyCodemod(
        async (project) => {
          let current = project;
          const touched = new Set<string>();
          const remappings: NodePathRemapping[][] = [];
          const collect = (result: CodemodNodeResult) => {
            current = applyCodemodChanges(current, result.changes);
            remappings.push(result.nodePathRemappings);
            for (const change of result.changes) {
              touched.add(change.filePath);
            }
          };

          const staticChanges = [...nodeChanges.values()].filter(
            ({ updates }) => updates.length > 0,
          );
          if (staticChanges.length > 0) {
            collect(
              updateMultipleNodeProps({
                project: current,
                changes: staticChanges.map(
                  ({ node, schema, updates, nodePathInfo }): NodePropChange => ({
                    node,
                    schema,
                    updates,
                    videoConfig: nodePathInfo.sequenceSubscriptionKey.videoConfigValues ?? videoConfig,
                  }),
                ),
              }),
            );
          }

          for (const { node, schema, keyframes, nodePathInfo } of nodeChanges.values()) {
            if (keyframes.length > 0) {
              collect(
                await updateNodeKeyframes({
                  project: current,
                  node,
                  updates: keyframes,
                  schema,
                  videoConfig: nodePathInfo.sequenceSubscriptionKey.videoConfigValues ?? videoConfig,
                }),
              );
            }
          }

          // One change per file, from the input project to the final contents.
          return {
            changes: [...touched].flatMap((filePath) => {
              const previousContents = project.files[filePath] ?? null;
              const nextContents = current.files[filePath] ?? null;
              return previousContents === nextContents
                ? []
                : [{ filePath, previousContents, nextContents }];
            }),
            nodePathRemappings: chainNodePathRemappings(remappings),
          };
        },
        {
          onApplied: (changed) => {
            if (!changed) {
              release();
            }
          },
        },
      );
      if (!ok) {
        release();
      }

      return ok;
    };

    /**
     * Shows keyframe changes on the canvas before they are written, e.g.
     * while an easing curve is being dragged. Changes of the same prop are
     * applied on top of each other.
     */
    const previewKeyframeChanges = (
      changes: readonly CanvasKeyframeChange[],
    ) => {
      const controller = ref.current.host?.controller;
      if (!controller) {
        return;
      }

      const statuses = new Map<string, CanUpdateSequencePropStatus>();
      for (const change of changes) {
        const sequenceKey = getCanvasSelectionItemKey({
          type: "sequence",
          nodePathInfo: change.nodePathInfo,
        });
        const propKey = `${sequenceKey}\0${change.key}`;
        const propStatus =
          statuses.get(propKey) ??
          ref.current.keyframedProps.find(
            (prop) =>
              prop.key === change.key &&
              getCanvasSelectionItemKey(prop.layer.selectionItem) ===
                sequenceKey,
          )?.propStatus;
        if (!propStatus) {
          continue;
        }

        const override = getCanvasKeyframeChangeOverride({
          propStatus,
          change,
        });
        if (override === null) {
          continue;
        }

        if (override.type === "keyframed") {
          statuses.set(propKey, override.status);
        }

        controller.overrides.set(change.nodePathInfo, change.key, override);
        pendingPreviews.set(sequenceKey, change.nodePathInfo);
      }
    };

    const setZoom = (zoom: PreviewZoom) => {
      dispatch({ type: "set-playback", patch: { zoom } });
    };

    const getCurrentZoom = () => {
      const { zoom } = ref.current.state.playback;
      if (zoom !== "fit") {
        return zoom;
      }

      // Approximate the fitted zoom using the Player's current scale.
      return getPlayer()?.getScale() ?? 1;
    };

    return {
      notify,
      notifyError,

      // Files
      editFile: (filePath: string, contents: string) => {
        dispatch({
          type: "set-files",
          files: { ...ref.current.state.files, [filePath]: contents },
          coalesceKey: `edit:${filePath}`,
        });
      },
      // File names are validated with the same rules as /api/project, so a
      // single bad name cannot make every later save fail.
      createFile: (input: string) => {
        const resolved = resolveProjectPathInput(input);
        if (resolved.error !== null) {
          notifyError(new Error(resolved.error));
          return;
        }

        const filePath = resolved.path;
        if (filePath in ref.current.state.files) {
          notifyError(new Error(`${filePath} already exists.`));
          return;
        }

        const componentName = getFileName(filePath).replace(/\.\w+$/, "");
        const contents = /\.(tsx|jsx)$/.test(filePath)
          ? `import React from "react";
import { AbsoluteFill } from "remotion";

export const ${componentName}: React.FC = () => {
  return <AbsoluteFill />;
};
`
          : "";
        dispatch({
          type: "set-files",
          files: { ...ref.current.state.files, [filePath]: contents },
          coalesceKey: null,
        });
        dispatch({ type: "open-file", filePath });
      },
      deleteFile: (filePath: string) => {
        if (filePath === ref.current.entryPoint) {
          notifyError(
            new Error(`${filePath} is the entry point and cannot be deleted.`),
          );
          return;
        }

        const files = { ...ref.current.state.files };
        delete files[filePath];
        dispatch({ type: "set-files", files, coalesceKey: null });
      },
      renameFile: (filePath: string, input: string) => {
        if (filePath === ref.current.entryPoint) {
          notifyError(
            new Error(`${filePath} is the entry point and cannot be renamed.`),
          );
          return;
        }

        const resolved = resolveProjectPathInput(input);
        if (resolved.error !== null) {
          notifyError(new Error(resolved.error));
          return;
        }

        const nextPath = resolved.path;
        const { files } = ref.current.state;
        if (nextPath === filePath) {
          return;
        }

        if (nextPath in files) {
          notifyError(new Error(`${nextPath} already exists.`));
          return;
        }

        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(files)) {
          next[key === filePath ? nextPath : key] = value;
        }

        dispatch({ type: "set-files", files: next, coalesceKey: null });
        dispatch({ type: "open-file", filePath: nextPath });
      },
      openFile: (filePath: string) => dispatch({ type: "open-file", filePath }),
      closeFile: (filePath: string) =>
        dispatch({ type: "close-file", filePath }),
      save: async () => {
        if (!canSave) {
          notify("Saving to disk is only available in development.");
          return;
        }

        const { files, savedFiles } = ref.current.state;
        const deleted = Object.keys(savedFiles).filter(
          (file) => !(file in files),
        );
        try {
          const response = await fetch(`${BASE_PATH}/api/project`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ files, deleted }),
          });
          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            throw new Error(body?.error ?? `Save failed (${response.status})`);
          }

          dispatch({ type: "mark-saved" });
          notify("Saved to src/remotion");
        } catch (error) {
          notifyError(error);
        }
      },
      undo: () => {
        dispatch({ type: "undo" });
        ref.current.host?.controller.selection.clear();
      },
      redo: () => {
        dispatch({ type: "redo" });
        ref.current.host?.controller.selection.clear();
      },

      // Layers. The selection follows the edited nodes through the node-path
      // remappings of each result.
      deleteNodes: (nodes: NodeReference[]) =>
        applyCodemod((project) => deleteNodesCodemod({ project, nodes })),
      duplicateNodes: (nodes: NodeReference[]) =>
        applyCodemod((project) => duplicateNodesCodemod({ project, nodes })),
      splitNodesAtPlayhead: (nodes: NodeReference[]) => {
        const frame = currentFrame();
        return applyCodemod((project) =>
          splitSequences({
            project,
            splits: nodes.map((node) => ({ node, frame })),
          }),
        );
      },
      wrapNode: (node: NodeReference, wrapper: "Sequence" | "AbsoluteFill") =>
        applyCodemod((project) =>
          wrapNode({
            project,
            node,
            wrapper: createElement({
              component: wrapper,
              importPath: "remotion",
            }),
          }),
        ),
      moveSelectedNodesOneStep: (node: NodeReference, direction: "up" | "down") => {
        const draggedLayer = ref.current.layers.find(
          (layer) =>
            layer.source?.filePath === node.filePath &&
            JSON.stringify(layer.source.nodePath) ===
              JSON.stringify(node.nodePath),
        );
        const selectedNodePathInfos = draggedLayer
          ? getCanvasSequenceReorderSelection({
              draggedItem: draggedLayer.selectionItem,
              selectedItems:
                ref.current.host?.controller.selection.getSnapshot()
                  .selectedItems ?? [],
            })
          : [];
        const nodesToMove = selectedNodePathInfos.map((info) => {
          const layer = ref.current.layers.find(
            (candidate) =>
              getCanvasSelectionItemKey(candidate.selectionItem) ===
              getCanvasSelectionItemKey({ type: "sequence", nodePathInfo: info }),
          );
          return layer?.source &&
            info.numberOfSequencesWithThisNodePath === 1 &&
            areSiblingNodes(layer.source, node)
            ? layer.source
            : null;
        });
        if (nodesToMove.some((selectedNode) => selectedNode === null)) {
          notify("Selected clips must be unique JSX siblings to reorder.");
          return Promise.resolve(false);
        }

        const moving = nodesToMove.length > 0 ? nodesToMove : [node];
        const siblings = ref.current.layers
          .map((layer) => layer.source)
          .filter(
            (source): source is NonNullable<typeof source> =>
              source !== null && areSiblingNodes(source, node),
          )
          .filter(
            (source, index, all) =>
              all.findIndex(
                (other) =>
                  JSON.stringify(other.nodePath) ===
                  JSON.stringify(source.nodePath),
              ) === index,
          );
        const selectedIndexes = moving.map((selectedNode) =>
          siblings.findIndex(
            (sibling) =>
              JSON.stringify(sibling.nodePath) ===
              JSON.stringify(selectedNode!.nodePath),
          ),
        );
        const target =
          siblings[
            direction === "up"
              ? Math.min(...selectedIndexes) - 1
              : Math.max(...selectedIndexes) + 1
          ];
        if (selectedIndexes.some((index) => index === -1) || !target) {
          notify("This layer cannot be moved further.");
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          reorderNodesCodemod({
            project,
            nodes: moving as NodeReference[],
            target,
            position: direction === "up" ? "before" : "after",
          }),
        );
      },
      reorderNodes: (
        nodes: NodeReference[],
        target: NodeReference,
        position: "before" | "after",
      ) =>
        applyCodemod((project) =>
          reorderNodesCodemod({ project, nodes, target, position }),
        ),
      updateNodeProps: (
        node: NodeReference,
        updates: SequencePropUpdate[],
        schema: InteractivitySchema | null,
      ) =>
        applyCodemod((project) =>
          updateNodeProps({
            project,
            node,
            updates,
            schema: schema ?? undefined,
            videoConfig: {
              width: ref.current.compositionWidth,
              height: ref.current.compositionHeight,
              fps: ref.current.compositionFps,
              durationInFrames: ref.current.compositionDurationInFrames,
            },
          }),
        ),
      /**
       * Shows prop values on the canvas without touching the source, e.g.
       * while a value is being scrubbed. Commit them with `commitLayerProps`.
       */
      previewLayerProps: (layer: Layer, values: Record<string, unknown>) => {
        const controller = ref.current.host?.controller;
        if (!controller || layer.track.nodePathInfo === null) {
          return;
        }

        for (const [key, value] of Object.entries(values)) {
          controller.overrides.set(layer.nodePathInfo, key, {
            type: "static",
            value,
          });
        }

        pendingPreviews.set(
          getCanvasSelectionItemKey(layer.selectionItem),
          layer.nodePathInfo,
        );
      },
      /** Drops a preview without writing to the source. */
      cancelLayerPreview: (layer: Layer) => clearPreview(layer),
      /** Writes previewed values to the source and releases the preview. */
      commitLayerProps: async (
        layer: Layer,
        updates: SequencePropUpdate[],
        schema: InteractivitySchema | null,
      ) => {
        const node = getNodeReference(layer.selectionItem);
        if (!node) {
          clearPreview(layer);
          return false;
        }

        const ok = await applyCodemod(
          (project) =>
            updateNodeProps({
              project,
              node,
              updates,
              schema: schema ?? undefined,
              videoConfig: layer.track.sequence.controls?.videoConfigValues ?? {
                width: ref.current.compositionWidth,
                height: ref.current.compositionHeight,
                fps: ref.current.compositionFps,
                durationInFrames: ref.current.compositionDurationInFrames,
              },
            }),
          {
            onApplied: (changed) => {
              if (!changed) {
                clearPreview(layer);
              }
            },
          },
        );
        if (!ok) {
          clearPreview(layer);
        }

        return ok;
      },
      /**
       * Writes the values of a canvas gesture, such as dragging outlines, to
       * the source. The canvas keeps previewing them until `releasePreviews`.
       */
      commitSequencePropChanges: (
        changes: readonly CanvasSequencePropChange[],
      ) => commitNodeChanges(groupNodeChanges(changes)),
      /**
       * Adds, removes or moves keyframes in the source. Moved keyframes stay
       * previewed on the canvas until `releasePreviews`.
       */
      commitKeyframeChanges: (changes: readonly CanvasKeyframeChange[]) =>
        commitNodeChanges(groupNodeChanges(changes)),
      previewKeyframeChanges,
      /** Drops the previews of keyframe changes without writing them. */
      cancelKeyframePreviews: (changes: readonly CanvasKeyframeChange[]) => {
        const controller = ref.current.host?.controller;
        for (const { nodePathInfo } of changes) {
          pendingPreviews.delete(
            getCanvasSelectionItemKey({ type: "sequence", nodePathInfo }),
          );
          controller?.overrides.clear(nodePathInfo);
        }
      },
      /**
       * Shows keyframe changes on the canvas right away and writes them to
       * the source, e.g. an easing preset or interpolation settings.
       */
      applyKeyframeChanges: (changes: readonly CanvasKeyframeChange[]) => {
        previewKeyframeChanges(changes);
        return commitNodeChanges(groupNodeChanges(changes));
      },
      /** Gives the easing segments the same easing. */
      applyEasing: (
        items: readonly EasingSelectionItem[],
        easing: CanvasKeyframeEasing,
      ) => {
        const changes = getEasingChanges({
          items,
          keyframedProps: ref.current.keyframedProps,
          easing,
        });
        previewKeyframeChanges(changes);
        return commitNodeChanges(groupNodeChanges(changes));
      },
      /** Removes the keyframes that are selected on the timeline. */
      deleteSelectedKeyframes: () => {
        const { host, keyframedProps, compositionDurationInFrames } =
          ref.current;
        if (!host) {
          return Promise.resolve(false);
        }

        const layers = new Map<string, Layer>();
        const changes = getSelectedKeyframes(
          host.controller.selection.getSnapshot().selectedItems,
        ).flatMap((item): CanvasKeyframeChange[] => {
          const prop = findKeyframedProp(keyframedProps, item);
          if (!prop) {
            return [];
          }

          const { change } = getCanvasKeyframeToggle({
            nodePathInfo: prop.layer.nodePathInfo,
            track: prop.layer.track,
            schema: prop.schema,
            key: prop.key,
            propStatus: prop.propStatus,
            frame: item.frame,
            durationInFrames: compositionDurationInFrames,
          });
          if (change?.operation.type !== "remove") {
            return [];
          }

          layers.set(
            getCanvasSelectionItemKey(prop.layer.selectionItem),
            prop.layer,
          );
          return [change];
        });
        if (changes.length === 0) {
          return Promise.resolve(false);
        }

        // The layers of the removed keyframes stay selected.
        host.controller.selection.setSelectedItems(
          [...layers.values()].map((layer) => layer.selectionItem),
        );
        return commitNodeChanges(groupNodeChanges(changes));
      },
      /**
       * Selects keyframes and easing segments. With an interaction, Shift
       * selects the range between the anchor and the item along the keyframe
       * rows, where segments sit between their keyframes.
       */
      selectKeyframes: (
        items: readonly (KeyframeSelectionItem | EasingSelectionItem)[],
        interaction: CanvasSelectionInteraction | null,
      ) => {
        const { host, keyframedProps } = ref.current;
        if (!host) {
          return;
        }

        const [item] = items;
        if (interaction === null || !item || items.length > 1) {
          host.controller.selection.setSelectedItems(items);
          return;
        }

        host.controller.selection.select(
          item,
          interaction,
          keyframedProps.flatMap((prop) =>
            prop.keyframes.flatMap((keyframe, index) => {
              const segment = prop.easingSegments.find(
                (candidate) => candidate.segmentIndex === index,
              );
              return [
                getKeyframeSelectionItem(prop, keyframe.frame),
                ...(segment ? [getEasingSelectionItem(prop, segment)] : []),
              ];
            }),
          ),
        );
      },
      /** Called once the preview shows the committed source again. */
      releasePreviews: () => {
        const controller = ref.current.host?.controller;
        for (const nodePathInfo of pendingPreviews.values()) {
          controller?.overrides.clear(nodePathInfo);
        }

        pendingPreviews.clear();
      },
      renameNode: (node: NodeReference, name: string) =>
        applyCodemod((project) =>
          updateNodeProps({
            project,
            node,
            updates: [
              {
                key: "name",
                value: name.trim() === "" ? undefined : name.trim(),
                defaultValue: null,
              },
            ],
          }),
        ),
      addSolid: () =>
        addElementAtPlayhead(() =>
          createElement({
            component: "Solid",
            importPath: "remotion",
            props: {
              width: ref.current.compositionWidth,
              height: ref.current.compositionHeight,
              color: "gray",
              style: { position: "absolute" },
            },
          }),
        ),
      addMedia: (type: "image" | "video" | "audio", src: string) =>
        addElementAtPlayhead(() =>
          type === "image"
            ? createElement({
                component: "CanvasImage",
                importPath: "remotion",
                props: { src },
              })
            : createElement({
                component: type === "video" ? "Video" : "Audio",
                importPath: "@remotion/media",
                props: { src },
              }),
        ),
      addComponent: (importName: string, importPath: string) =>
        addElementAtPlayhead(() =>
          createElement({ component: importName, importPath }),
        ),
      resolveCompositionSource: () => {
        try {
          const { activeComposition, compositionFile } = requireComposition();
          return resolveCompositionComponent({
            project: getProject(),
            compositionFile,
            compositionId: activeComposition.id,
          });
        } catch {
          return null;
        }
      },

      // Compositions
      selectComposition: (compositionId: string) => {
        dispatch({ type: "select-composition", compositionId });
        ref.current.host?.controller.selection.clear();
      },
      updateCompositionMetadata: (
        compositionId: string,
        metadata: Partial<CompositionMetadata>,
      ) => {
        const { compositionFile } = ref.current;
        if (!compositionFile) {
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          updateCompositionMetadata({
            project,
            compositionFile,
            compositionId,
            metadata,
          }),
        );
      },
      renameComposition: async (compositionId: string, newId: string) => {
        const { compositionFile } = ref.current;
        if (
          !compositionFile ||
          newId.trim() === "" ||
          newId === compositionId
        ) {
          return false;
        }

        const ok = await applyCodemod((project) =>
          renameComposition({
            project,
            compositionFile,
            compositionId,
            newId: newId.trim(),
          }),
        );
        if (ok && ref.current.state.compositionId === compositionId) {
          dispatch({ type: "select-composition", compositionId: newId.trim() });
        }

        return ok;
      },
      duplicateComposition: async (compositionId: string) => {
        const { compositionFile, compositions } = ref.current;
        if (!compositionFile) {
          return false;
        }

        let newId = `${compositionId}Copy`;
        let counter = 2;
        while (compositions.some((composition) => composition.id === newId)) {
          newId = `${compositionId}Copy${counter++}`;
        }

        const ok = await applyCodemod((project) =>
          duplicateComposition({
            project,
            compositionFile,
            compositionId,
            newId,
          }),
        );
        if (ok) {
          dispatch({ type: "select-composition", compositionId: newId });
        }

        return ok;
      },
      deleteComposition: async (compositionId: string) => {
        const { compositionFile, compositions } = ref.current;
        if (!compositionFile) {
          return false;
        }

        if (compositions.length <= 1) {
          notifyError(new Error("A project needs at least one composition."));
          return false;
        }

        const ok = await applyCodemod((project) =>
          deleteComposition({ project, compositionFile, compositionId }),
        );
        if (ok && ref.current.state.compositionId === compositionId) {
          const remaining = compositions.find(
            (composition) => composition.id !== compositionId,
          );
          dispatch({
            type: "select-composition",
            compositionId: remaining?.id ?? null,
          });
        }

        return ok;
      },
      addComposition: async (
        compositionId: string,
        folder: FolderReference | null,
      ) => {
        const { compositionFile, compositions, state } = ref.current;
        if (!compositionFile) {
          return false;
        }

        const id = compositionId.trim();
        if (!/^[A-Za-z][\w-]*$/.test(id)) {
          notifyError(
            new Error(
              "Composition IDs may only contain letters, numbers, - and _.",
            ),
          );
          return false;
        }

        if (compositions.some((composition) => composition.id === id)) {
          notifyError(new Error(`A composition "${id}" already exists.`));
          return false;
        }

        const componentName = id.replace(/[^A-Za-z0-9_$]/g, "");
        const directory = compositionFile.split("/").slice(0, -1).join("/");
        const componentFile = `${directory}/${componentName}.tsx`;
        if (componentFile in state.files) {
          notifyError(new Error(`${componentFile} already exists.`));
          return false;
        }

        const componentSource = `import React from "react";
import { AbsoluteFill, Interactive } from "remotion";

export const ${componentName}: React.FC = () => {
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#0b1020", justifyContent: "center", alignItems: "center" }}
    >
      <Interactive.H1
        name="Title"
        style={{ color: "white", fontFamily: "sans-serif", fontSize: 80, margin: 0 }}
      >
        ${id}
      </Interactive.H1>
    </AbsoluteFill>
  );
};
`;
        try {
          const project = {
            ...getProject(),
            files: { ...state.files, [componentFile]: componentSource },
          };
          const result = addComposition({
            project,
            compositionFile,
            compositionId: id,
            component: {
              importName: componentName,
              importPath: `./${componentName}`,
            },
            metadata: {
              width: 1920,
              height: 1080,
              fps: 30,
              durationInFrames: 150,
            },
            folder: folder ?? undefined,
          });
          const files = {
            ...applyCodemodChanges(project, result.changes).files,
          };
          files[compositionFile] = await formatSource(
            compositionFile,
            files[compositionFile],
          );
          dispatch({ type: "set-files", files, coalesceKey: null });
          dispatch({ type: "select-composition", compositionId: id });
          dispatch({ type: "open-file", filePath: componentFile });
          return true;
        } catch (error) {
          notifyError(error);
          return false;
        }
      },
      /**
       * Moves a composition or folder within the registration file: into a
       * folder, to the root, or before or after another registration.
       */
      moveRegistration: (
        item: CompositionTreeItem,
        destination: CompositionDestination,
      ) => {
        const { compositionFile } = ref.current;
        if (!compositionFile) {
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          item.type === "composition"
            ? moveComposition({
                project,
                compositionFile,
                compositionId: item.compositionId,
                destination,
              })
            : moveFolder({
                project,
                compositionFile,
                folder: { name: item.name, parentName: item.parentName },
                destination,
              }),
        );
      },
      addFolder: (name: string, parentName: string | null) => {
        const { compositionFile } = ref.current;
        if (!compositionFile || name.trim() === "") {
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          addFolder({
            project,
            compositionFile,
            folder: { name: name.trim(), parentName },
          }),
        );
      },
      renameFolder: (folder: FolderReference, newName: string) => {
        const { compositionFile } = ref.current;
        if (
          !compositionFile ||
          newName.trim() === "" ||
          newName.trim() === folder.name
        ) {
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          renameFolder({
            project,
            compositionFile,
            folder,
            newName: newName.trim(),
          }),
        );
      },
      /** Removes a folder element; the registrations inside it stay. */
      deleteFolder: (folder: FolderReference) => {
        const { compositionFile } = ref.current;
        if (!compositionFile) {
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          unwrapFolder({ project, compositionFile, folder }),
        );
      },
      setDefaultProps: (
        compositionId: string,
        defaultProps: Record<string, CodemodValue>,
      ) => {
        const { compositionFile } = ref.current;
        if (!compositionFile) {
          return Promise.resolve(false);
        }

        return applyCodemod((project) =>
          setCompositionDefaultProps({
            project,
            compositionFile,
            compositionId,
            defaultProps,
          }),
        );
      },
      setPropsOverride: (props: Record<string, unknown> | null) =>
        dispatch({ type: "set-props-override", props }),

      // Playback
      play: () => getPlayer()?.play(),
      pause: () => getPlayer()?.pause(),
      togglePlayback: () => getPlayer()?.toggle(),
      seek,
      step: (delta: number) => {
        const player = getPlayer();
        if (!player) {
          return;
        }

        player.pause();
        seek(player.getCurrentFrame() + delta);
      },
      seekToStart: () => seek(ref.current.state.playback.inFrame ?? 0),
      seekToEnd: () =>
        seek(
          ref.current.state.playback.outFrame ??
            ref.current.compositionDurationInFrames - 1,
        ),
      returnToStart: () => {
        getPlayer()?.pause();
        seek(ref.current.state.playback.inFrame ?? 0);
      },
      setPlaybackRate: (playbackRate: number) => {
        dispatch({ type: "set-playback", patch: { playbackRate } });
        ref.current.host?.setOptions({ playbackRate });
      },
      setInPoint: () => {
        const frame = currentFrame();
        const { outFrame } = ref.current.state.playback;
        dispatch({
          type: "set-playback",
          patch: {
            inFrame: frame,
            outFrame: outFrame !== null && outFrame <= frame ? null : outFrame,
          },
        });
      },
      setOutPoint: () => {
        const frame = currentFrame();
        const { inFrame } = ref.current.state.playback;
        dispatch({
          type: "set-playback",
          patch: {
            outFrame: frame,
            inFrame: inFrame !== null && inFrame >= frame ? null : inFrame,
          },
        });
      },
      setInOut: (inFrame: number | null, outFrame: number | null) =>
        dispatch({ type: "set-playback", patch: { inFrame, outFrame } }),
      clearInOut: () =>
        dispatch({
          type: "set-playback",
          patch: { inFrame: null, outFrame: null },
        }),
      toggleLoop: () =>
        dispatch({
          type: "set-playback",
          patch: { loop: !ref.current.state.playback.loop },
        }),
      toggleMute: () => {
        const player = getPlayer();
        if (!player) {
          return;
        }

        if (player.isMuted()) {
          player.unmute();
        } else {
          player.mute();
        }
      },
      setVolume: (volume: number) => getPlayer()?.setVolume(volume),
      setZoom,
      zoomIn: () => {
        const current = getCurrentZoom();
        setZoom(
          zoomLevels.find((level) => level > current + 0.001) ??
            zoomLevels.at(-1)!,
        );
      },
      zoomOut: () => {
        const current = getCurrentZoom();
        setZoom(
          [...zoomLevels].reverse().find((level) => level < current - 0.001) ??
            zoomLevels[0],
        );
      },
      toggleOutlines: () =>
        dispatch({
          type: "set-playback",
          patch: { showOutlines: !ref.current.state.playback.showOutlines },
        }),
      toggleCheckerboard: () =>
        dispatch({
          type: "set-playback",
          patch: { checkerboard: !ref.current.state.playback.checkerboard },
        }),
      toggleFullscreen: () => {
        const player = getPlayer();
        if (!player) {
          return;
        }

        if (player.isFullscreen()) {
          player.exitFullscreen();
        } else {
          player.requestFullscreen();
        }
      },

      // Selection
      selectLayer: (layer: Layer, interaction: CanvasSelectionInteraction) => {
        const { host, layers } = ref.current;
        host?.controller.selection.select(
          layer.selectionItem,
          interaction,
          layers.map((item) => item.selectionItem),
        );
      },
      selectAll: () => {
        const { host, layers } = ref.current;
        host?.controller.selection.setSelectedItems(
          layers.map((layer) => layer.selectionItem),
        );
      },
      clearSelection: () => ref.current.host?.controller.selection.clear(),

      // UI
      reveal: (filePath: string, line: number | null, column: number | null) =>
        dispatch({
          type: "reveal",
          filePath,
          line: line ?? 1,
          column: (column ?? 0) + 1,
        }),
      toggleSidebar: () =>
        dispatch({
          type: "set-layout",
          patch: { showSidebar: !ref.current.state.layout.showSidebar },
        }),
      toggleInspector: () =>
        dispatch({
          type: "set-layout",
          patch: { showInspector: !ref.current.state.layout.showInspector },
        }),
      toggleCode: () =>
        dispatch({
          type: "set-layout",
          patch: { showCode: !ref.current.state.layout.showCode },
        }),
      toggleTimeline: () =>
        dispatch({
          type: "set-layout",
          patch: { showTimeline: !ref.current.state.layout.showTimeline },
        }),
      openDialog: (dialog: EditorState["dialog"]) =>
        dispatch({ type: "set-dialog", dialog }),

      // Rendering
      startRender: async (request: PreviewRenderRequest) => {
        const { host, activeComposition } = ref.current;
        if (!host || !activeComposition) {
          notifyError(new Error("Nothing to render yet."));
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const extension =
          request.kind === "still" ? request.format : request.container;
        const job: RenderJob = {
          id,
          compositionId: activeComposition.id,
          fileName: `${activeComposition.id}.${extension}`,
          kind: request.kind,
          status: "rendering",
          progress: 0,
          url: null,
          sizeInBytes: null,
          error: null,
          startedAt: Date.now(),
          finishedAt: null,
        };
        const controller = new AbortController();
        renderControllers.set(id, controller);
        dispatch({ type: "add-render", job });
        dispatch({
          type: "set-layout",
          patch: { inspectorTab: "renders", showInspector: true },
        });
        try {
          const result = await host.render(request, {
            signal: controller.signal,
            onProgress: (progress) =>
              dispatch({
                type: "update-render",
                id,
                patch: { progress: progress.progress },
              }),
          });
          dispatch({
            type: "update-render",
            id,
            patch: {
              status: "done",
              progress: 1,
              url: result.url,
              sizeInBytes: result.sizeInBytes,
              finishedAt: Date.now(),
            },
          });
        } catch (error) {
          dispatch({
            type: "update-render",
            id,
            patch: {
              status: controller.signal.aborted ? "cancelled" : "error",
              error: controller.signal.aborted ? null : getErrorMessage(error),
              finishedAt: Date.now(),
            },
          });
        } finally {
          renderControllers.delete(id);
        }
      },
      cancelRender: (id: string) => renderControllers.get(id)?.abort(),
      removeRender: (id: string) => {
        renderControllers.get(id)?.abort();
        const job = ref.current.state.renders.find(
          (render) => render.id === id,
        );
        if (job?.url) {
          URL.revokeObjectURL(job.url);
        }

        dispatch({ type: "remove-render", id });
      },
    };
  }, [canSave, dispatch, playback]);
};

const renderControllers = new Map<string, AbortController>();

export type EditorActions = ReturnType<typeof useEditorActions>;
