"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIcon,
  CodeIcon,
  CopyIcon,
  ImageIcon,
  LayersIcon,
  Music2Icon,
  PlusIcon,
  ScissorsIcon,
  SquareIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNodeReference, type Layer } from "../../model/layers";
import { getLayerSchema, hasTimingProps } from "../../model/schemas";
import { useEditor } from "../../state/editor-context";
import { ToolbarButton } from "../TopBar";

export const useLayerCommands = (layer: Layer) => {
  const { actions } = useEditor();
  const node = getNodeReference(layer.selectionItem);
  const schema = getLayerSchema(layer);
  const source = layer.source;

  return {
    node,
    canSplit: node !== null && hasTimingProps(schema),
    reveal: () => {
      if (source) {
        actions.reveal(
          source.filePath,
          source.location?.line ?? null,
          source.location?.column ?? null,
        );
      }
    },
    remove: () => node && void actions.deleteNodes([node]),
    duplicate: () => node && void actions.duplicateNodes([node]),
    split: () => node && void actions.splitNodesAtPlayhead([node]),
    wrapInSequence: () => node && void actions.wrapNode(node, "Sequence"),
    wrapInAbsoluteFill: () =>
      node && void actions.wrapNode(node, "AbsoluteFill"),
    moveUp: () => node && void actions.reorderNode(node, "up"),
    moveDown: () => node && void actions.reorderNode(node, "down"),
  };
};

export const LayerContextMenu: React.FC<{
  readonly layer: Layer;
  readonly children: React.ReactNode;
}> = ({ layer, children }) => {
  const commands = useLayerCommands(layer);
  const { actions } = useEditor();
  const hasSource = layer.source !== null;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="min-w-[200px]"
      >
        <ContextMenuItem
          onSelect={() =>
            actions.selectLayer(layer, { shiftKey: false, toggleKey: false })
          }
        >
          Select
        </ContextMenuItem>
        <ContextMenuItem disabled={!hasSource} onSelect={commands.reveal}>
          <CodeIcon /> Reveal in code
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!hasSource} onSelect={commands.duplicate}>
          <CopyIcon /> Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!commands.canSplit}
          onSelect={commands.split}
        >
          <ScissorsIcon /> Split at playhead
          <ContextMenuShortcut>⌘⇧D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger disabled={!hasSource}>
            <BoxIcon /> Wrap in
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={commands.wrapInSequence}>
              &lt;Sequence&gt;
            </ContextMenuItem>
            <ContextMenuItem onSelect={commands.wrapInAbsoluteFill}>
              &lt;AbsoluteFill&gt;
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!hasSource} onSelect={commands.moveUp}>
          <ArrowUpIcon /> Move up
          <ContextMenuShortcut>⌥↑</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={!hasSource} onSelect={commands.moveDown}>
          <ArrowDownIcon /> Move down
          <ContextMenuShortcut>⌥↓</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          disabled={!hasSource}
          onSelect={commands.remove}
        >
          <Trash2Icon /> Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const LayerActionBar: React.FC<{ readonly layer: Layer }> = ({
  layer,
}) => {
  const commands = useLayerCommands(layer);
  const hasSource = layer.source !== null;

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        size="icon-sm"
        label="Reveal in code"
        onClick={commands.reveal}
        disabled={!hasSource}
      >
        <CodeIcon />
      </ToolbarButton>
      <ToolbarButton
        size="icon-sm"
        label="Duplicate"
        shortcut="⌘D"
        onClick={commands.duplicate}
        disabled={!hasSource}
      >
        <CopyIcon />
      </ToolbarButton>
      <ToolbarButton
        size="icon-sm"
        label="Split at playhead"
        shortcut="⌘⇧D"
        onClick={commands.split}
        disabled={!commands.canSplit}
      >
        <ScissorsIcon />
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Wrap in"
            disabled={!hasSource}
          >
            <BoxIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Wrap in</DropdownMenuLabel>
          <DropdownMenuItem onSelect={commands.wrapInSequence}>
            &lt;Sequence&gt;
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={commands.wrapInAbsoluteFill}>
            &lt;AbsoluteFill&gt;
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ToolbarButton
        size="icon-sm"
        label="Move up"
        shortcut="⌥↑"
        onClick={commands.moveUp}
        disabled={!hasSource}
      >
        <ArrowUpIcon />
      </ToolbarButton>
      <ToolbarButton
        size="icon-sm"
        label="Move down"
        shortcut="⌥↓"
        onClick={commands.moveDown}
        disabled={!hasSource}
      >
        <ArrowDownIcon />
      </ToolbarButton>
      <span className="flex-1" />
      <ToolbarButton
        size="icon-sm"
        label="Delete"
        shortcut="⌫"
        onClick={commands.remove}
        disabled={!hasSource}
        className="hover:text-destructive-foreground"
      >
        <Trash2Icon />
      </ToolbarButton>
    </div>
  );
};

const promptForUrl = (label: string) => {
  const url = window.prompt(`${label} URL`, "https://");
  return url && url !== "https://" ? url.trim() : null;
};

export const AddLayerMenu: React.FC<{ readonly size?: "sm" | "xs" }> = ({
  size = "xs",
}) => {
  const { actions, activeComposition, mainFile, state } = useEditor();
  const components = Object.keys(state.files)
    .filter((filePath) => /\.tsx$/.test(filePath) && filePath !== mainFile)
    .flatMap((filePath) => {
      const matches = [
        ...state.files[filePath].matchAll(
          /export\s+(?:const|function)\s+([A-Z]\w*)/g,
        ),
      ];
      return matches.map((match) => ({ filePath, name: match[1] }));
    })
    .filter(({ name }) => name !== "RemotionRoot");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size={size} disabled={!activeComposition}>
          <PlusIcon /> Add layer
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuLabel>Insert at the playhead</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => void actions.addSolid()}>
          <SquareIcon /> Solid color
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const url = promptForUrl("Image");
            if (url) void actions.addMedia("image", url);
          }}
        >
          <ImageIcon /> Image from URL…
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const url = promptForUrl("Video");
            if (url) void actions.addMedia("video", url);
          }}
        >
          <VideoIcon /> Video from URL…
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const url = promptForUrl("Audio");
            if (url) void actions.addMedia("audio", url);
          }}
        >
          <Music2Icon /> Audio from URL…
        </DropdownMenuItem>
        {components.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Components in this project</DropdownMenuLabel>
            {components.map(({ filePath, name }) => (
              <DropdownMenuItem
                key={`${filePath}:${name}`}
                onSelect={() => {
                  // Import path relative to the file the component is
                  // inserted into (the composition's component file).
                  const from = (mainFile ?? activeComposition!.filePath)
                    .split("/")
                    .slice(0, -1);
                  const target = filePath.replace(/\.tsx$/, "").split("/");
                  const common = from.findIndex(
                    (segment, index) => segment !== target[index],
                  );
                  const up = common === -1 ? 0 : from.length - common;
                  const rest = target.slice(
                    common === -1 ? from.length : common,
                  );
                  const importPath = `${up === 0 ? "./" : "../".repeat(up)}${rest.join("/")}`;
                  void actions.addComponent(name, importPath);
                }}
              >
                <LayersIcon /> {name}
                <span className="text-muted-foreground-dim ml-auto font-mono text-[10px]">
                  {filePath.split("/").at(-1)}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
