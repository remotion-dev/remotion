"use client";

import {
  getCanvasSelectionItemKey,
  useCanvasSelection,
} from "@remotion/canvas";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSelectedNodes } from "../../hooks/use-editor-shortcuts";
import { getLayerLabel } from "../../model/layers";
import { useEditor } from "../../state/editor-context";
import { fallbackSelectionController } from "../../state/fallback-selection";
import { CompositionInspector } from "./CompositionInspector";
import { LayerInspector } from "./LayerInspector";
import { RendersPanel } from "./RendersPanel";

const SelectionInspector: React.FC = () => {
  const { host, layers, actions } = useEditor();
  const selection = useCanvasSelection(
    host?.controller.selection ?? fallbackSelectionController,
  );
  const selectedLayers = useMemo(() => {
    const keys = new Set(
      selection.selectedItems.map(getCanvasSelectionItemKey),
    );
    return layers.filter((layer) =>
      keys.has(getCanvasSelectionItemKey(layer.selectionItem)),
    );
  }, [layers, selection.selectedItems]);

  if (selectedLayers.length === 0) {
    return <CompositionInspector />;
  }

  if (selectedLayers.length === 1) {
    return (
      <LayerInspector
        key={getCanvasSelectionItemKey(selectedLayers[0].selectionItem)}
        layer={selectedLayers[0]}
      />
    );
  }

  const nodes = getSelectedNodes(host, layers);
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="text-sm font-medium">
        {selectedLayers.length} layers selected
      </div>
      <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
        {selectedLayers.map((layer) => (
          <li key={layer.track.sequence.id} className="truncate">
            · {getLayerLabel(layer)}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="xs"
          variant="secondary"
          disabled={nodes.length === 0}
          onClick={() => void actions.duplicateNodes(nodes)}
        >
          Duplicate
        </Button>
        <Button
          size="xs"
          variant="secondary"
          disabled={nodes.length === 0}
          onClick={() => void actions.splitNodesAtPlayhead(nodes)}
        >
          Split at playhead
        </Button>
        <Button
          size="xs"
          variant="destructive"
          disabled={nodes.length === 0}
          onClick={() => void actions.deleteNodes(nodes)}
        >
          Delete
        </Button>
        <Button size="xs" variant="ghost" onClick={actions.clearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  );
};

export const InspectorPanel: React.FC = () => {
  const { state, dispatch } = useEditor();
  const rendering = state.renders.filter(
    (job) => job.status === "rendering",
  ).length;

  return (
    <Tabs
      value={state.layout.inspectorTab}
      onValueChange={(value) =>
        dispatch({
          type: "set-layout",
          patch: { inspectorTab: value as "inspector" | "renders" },
        })
      }
      className="flex min-h-0 flex-1 flex-col"
    >
      <TabsList>
        <TabsTrigger value="inspector">Inspector</TabsTrigger>
        <TabsTrigger value="renders">
          Renders
          {state.renders.length > 0 ? (
            <span className="bg-muted text-muted-foreground rounded-full px-1.5 text-[10px]">
              {rendering > 0 ? `${rendering} active` : state.renders.length}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inspector" className="min-h-0 overflow-y-auto">
        <SelectionInspector />
      </TabsContent>
      <TabsContent value="renders" className="min-h-0 overflow-y-auto">
        <RendersPanel />
      </TabsContent>
    </Tabs>
  );
};
