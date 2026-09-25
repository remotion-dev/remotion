"use client";

import { getCanvasSelectionItemKey } from "@remotion/canvas";
import { useCallback, useEffect, useRef } from "react";
import type { PreviewHost, PreviewKeyEvent } from "@/preview/bridge";
import type { CompositionInfo } from "../model/compositions";
import { getNodeReference, type Layer } from "../model/layers";
import type { EditorState } from "../state/editor-store";
import type { EditorActions } from "./use-editor-actions";
import type { PlaybackStore } from "./use-playback";

const isEditableElement = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA");

/**
 * Keyboard shortcuts work in the editor window and inside the preview iframe,
 * which forwards its key events through the bridge.
 */
export const useEditorShortcuts = ({
  actions,
  playback,
  context,
}: {
  actions: EditorActions;
  playback: PlaybackStore;
  context: {
    state: EditorState;
    host: PreviewHost | null;
    layers: Layer[];
    compositions: CompositionInfo[];
    fps: number;
  };
}) => {
  const ref = useRef(context);
  ref.current = context;

  const handleKey = useCallback(
    (event: PreviewKeyEvent): boolean => {
      const { state, host, layers, compositions, fps } = ref.current;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key;
      const lower = key.toLowerCase();

      if (state.dialog !== null) {
        return false;
      }

      // Shortcuts that also work while typing.
      if (mod && lower === "s") {
        void actions.save();
        return true;
      }

      if (event.isEditable) {
        return false;
      }

      if (mod && !event.altKey) {
        if (lower === "z") {
          if (event.shiftKey) {
            actions.redo();
          } else {
            actions.undo();
          }

          return true;
        }

        if (lower === "y" && !event.shiftKey) {
          actions.redo();
          return true;
        }

        const selectedNodes = getSelectedNodes(host, layers);
        if (lower === "d") {
          if (selectedNodes.length === 0) {
            return true;
          }

          if (event.shiftKey) {
            void actions.splitNodesAtPlayhead(selectedNodes);
          } else {
            void actions.duplicateNodes(selectedNodes);
          }

          return true;
        }

        if (lower === "a") {
          actions.selectAll();
          return true;
        }

        if (lower === "b") {
          actions.toggleSidebar();
          return true;
        }

        if (lower === "j") {
          actions.toggleInspector();
          return true;
        }

        if (lower === "e") {
          actions.toggleCode();
          return true;
        }

        if (key === ".") {
          actions.toggleTimeline();
          return true;
        }

        if (key === "=" || key === "+") {
          actions.zoomIn();
          return true;
        }

        if (key === "-") {
          actions.zoomOut();
          return true;
        }

        if (key === "0") {
          actions.setZoom("fit");
          return true;
        }

        return false;
      }

      if (event.altKey) {
        if (key === "ArrowUp" || key === "ArrowDown") {
          const [node] = getSelectedNodes(host, layers);
          if (node) {
            void actions.reorderNode(node, key === "ArrowUp" ? "up" : "down");
          }

          return true;
        }

        return false;
      }

      switch (key) {
        case " ":
          if (event.repeat) return true;
          actions.togglePlayback();
          return true;
        case "ArrowLeft":
          actions.step(event.shiftKey ? -fps : -1);
          return true;
        case "ArrowRight":
          actions.step(event.shiftKey ? fps : 1);
          return true;
        case "Home":
          actions.seekToStart();
          return true;
        case "End":
          actions.seekToEnd();
          return true;
        case "Enter":
          actions.returnToStart();
          return true;
        case "Escape":
          actions.clearSelection();
          return true;
        case "Backspace":
        case "Delete": {
          if (event.repeat) return true;
          const selectedNodes = getSelectedNodes(host, layers);
          if (selectedNodes.length > 0) {
            void actions.deleteNodes(selectedNodes);
          }

          return true;
        }

        case "PageUp":
        case "PageDown": {
          const index = compositions.findIndex(
            (composition) => composition.id === state.compositionId,
          );
          const next =
            compositions[
              (index + (key === "PageUp" ? -1 : 1) + compositions.length) %
                compositions.length
            ];
          if (next) {
            actions.selectComposition(next.id);
          }

          return true;
        }

        case "+":
        case "=":
          actions.zoomIn();
          return true;
        case "-":
        case "_":
          actions.zoomOut();
          return true;
        case "0":
          actions.setZoom("fit");
          return true;
        case "?":
          actions.openDialog("shortcuts");
          return true;
        default:
          break;
      }

      if (event.shiftKey) {
        if (lower === "l") {
          actions.toggleLoop();
          return true;
        }

        if (lower === "o") {
          actions.toggleOutlines();
          return true;
        }

        return false;
      }

      switch (lower) {
        case "k":
          actions.pause();
          return true;
        case "l": {
          const { playing } = playback.getSnapshot();
          if (playing) {
            const rate = state.playback.playbackRate;
            actions.setPlaybackRate(rate >= 4 ? 1 : rate * 2);
          } else {
            actions.setPlaybackRate(1);
            actions.play();
          }

          return true;
        }

        case "a":
          actions.seekToStart();
          return true;
        case "e":
          actions.seekToEnd();
          return true;
        case "i":
          actions.setInPoint();
          return true;
        case "o":
          actions.setOutPoint();
          return true;
        case "x":
          actions.clearInOut();
          return true;
        case "m":
          actions.toggleMute();
          return true;
        case "t":
          actions.toggleCheckerboard();
          return true;
        case "f":
          actions.toggleFullscreen();
          return true;
        case "r":
          actions.openDialog("render");
          return true;
        case "g": {
          const input =
            document.querySelector<HTMLInputElement>("[data-frame-input]");
          input?.focus();
          input?.select();
          return true;
        }

        default:
          return false;
      }
    },
    [actions, playback],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const handled = handleKey({
        key: event.key,
        code: event.code,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        repeat: event.repeat,
        isEditable: isEditableElement(event.target),
      });
      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  return handleKey;
};

export const getSelectedNodes = (host: PreviewHost | null, layers: Layer[]) => {
  if (!host) {
    return [];
  }

  const selectedKeys = new Set(
    host.controller.selection
      .getSnapshot()
      .selectedItems.map(getCanvasSelectionItemKey),
  );
  const nodes = new Map<string, ReturnType<typeof getNodeReference>>();
  for (const layer of layers) {
    if (!selectedKeys.has(getCanvasSelectionItemKey(layer.selectionItem))) {
      continue;
    }

    const node = getNodeReference(layer.selectionItem);
    if (node) {
      nodes.set(JSON.stringify(node), node);
    }
  }

  return [...nodes.values()].filter(
    (node): node is NonNullable<typeof node> => node !== null,
  );
};
