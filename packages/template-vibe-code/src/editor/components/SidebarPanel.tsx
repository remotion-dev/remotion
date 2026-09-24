"use client";

import {
  FileCode2Icon,
  FileIcon,
  FilmIcon,
  ImageIcon,
  PlusIcon,
} from "lucide-react";
import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { CompositionInfo } from "../model/compositions";
import { getFileName, sortFilePaths } from "../model/project";
import { useEditor } from "../state/editor-context";
import { ToolbarButton } from "./TopBar";

const InlineInput: React.FC<{
  readonly placeholder: string;
  readonly initialValue?: string;
  readonly onSubmit: (value: string) => void;
  readonly onCancel: () => void;
}> = ({ placeholder, initialValue = "", onSubmit, onCancel }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      className="px-2 py-1"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) {
          onSubmit(value.trim());
        } else {
          onCancel();
        }
      }}
    >
      <Input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => (value.trim() ? onSubmit(value.trim()) : onCancel())}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
      />
    </form>
  );
};

const CompositionRow: React.FC<{
  readonly composition: CompositionInfo;
  readonly active: boolean;
}> = ({ composition, active }) => {
  const { actions, compositions } = useEditor();
  const [renaming, setRenaming] = useState(false);

  if (renaming) {
    return (
      <InlineInput
        placeholder="Composition ID"
        initialValue={composition.id}
        onSubmit={(newId) => {
          setRenaming(false);
          void actions.renameComposition(composition.id, newId);
        }}
        onCancel={() => setRenaming(false)}
      />
    );
  }

  const duration =
    composition.durationInFrames !== null && composition.fps
      ? `${(composition.durationInFrames / composition.fps).toFixed(1)}s`
      : composition.tagName === "Still"
        ? "Still"
        : "—";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          aria-pressed={active}
          onClick={() => actions.selectComposition(composition.id)}
          onDoubleClick={() => setRenaming(true)}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs outline-none",
            active
              ? "bg-selection-dim/60 text-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          {composition.tagName === "Still" ? (
            <ImageIcon className="size-3.5 shrink-0 opacity-70" />
          ) : (
            <FilmIcon className="size-3.5 shrink-0 opacity-70" />
          )}
          <span className="min-w-0 flex-1 truncate font-medium">
            {composition.id}
          </span>
          <span className="text-muted-foreground-dim shrink-0 font-mono text-[10px]">
            {composition.width}×{composition.height} · {duration}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setRenaming(true)}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => void actions.duplicateComposition(composition.id)}
        >
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() =>
            actions.reveal(composition.filePath, composition.line, null)
          }
        >
          Reveal in code
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          disabled={compositions.length <= 1}
          onSelect={() => void actions.deleteComposition(composition.id)}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

const FileRow: React.FC<{
  readonly filePath: string;
  readonly active: boolean;
}> = ({ filePath, active }) => {
  const { actions, state } = useEditor();
  const [renaming, setRenaming] = useState(false);
  const isEntry =
    Object.keys(state.files).length > 1 && /index\.tsx?$/.test(filePath);

  if (renaming) {
    return (
      <InlineInput
        placeholder="File path"
        initialValue={filePath}
        onSubmit={(next) => {
          setRenaming(false);
          if (next !== filePath) {
            actions.renameFile(filePath, next);
          }
        }}
        onCancel={() => setRenaming(false)}
      />
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          aria-pressed={active}
          onClick={() => actions.openFile(filePath)}
          onDoubleClick={() => setRenaming(true)}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs outline-none",
            active
              ? "bg-selection-dim/60 text-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          {/\.(tsx|jsx|ts|js)$/.test(filePath) ? (
            <FileCode2Icon className="size-3.5 shrink-0 opacity-70" />
          ) : (
            <FileIcon className="size-3.5 shrink-0 opacity-70" />
          )}
          <span className="min-w-0 flex-1 truncate">
            {getFileName(filePath)}
          </span>
          <span className="text-muted-foreground-dim shrink-0 truncate font-mono text-[10px]">
            {filePath.split("/").slice(0, -1).join("/")}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setRenaming(true)}>
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          disabled={isEntry}
          onSelect={() => actions.deleteFile(filePath)}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const SidebarPanel: React.FC = () => {
  const { state, dispatch, actions, compositions, activeComposition } =
    useEditor();
  const [creating, setCreating] = useState<"composition" | "file" | null>(null);
  const directory =
    Object.keys(state.files)[0]?.split("/").slice(0, -1).join("/") ?? "src";

  return (
    <Tabs
      value={state.layout.sidebarTab}
      onValueChange={(value) =>
        dispatch({
          type: "set-layout",
          patch: { sidebarTab: value as "compositions" | "files" },
        })
      }
      className="flex min-h-0 flex-1 flex-col"
    >
      <TabsList>
        <TabsTrigger value="compositions">Compositions</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <div className="flex-1" />
        <ToolbarButton
          size="icon-xs"
          label={
            state.layout.sidebarTab === "compositions"
              ? "New composition"
              : "New file"
          }
          onClick={() =>
            setCreating(
              state.layout.sidebarTab === "compositions"
                ? "composition"
                : "file",
            )
          }
          className="mb-1"
        >
          <PlusIcon />
        </ToolbarButton>
      </TabsList>
      <TabsContent
        value="compositions"
        className="min-h-0 overflow-y-auto py-1"
      >
        {creating === "composition" ? (
          <InlineInput
            placeholder="New composition ID"
            onSubmit={(id) => {
              setCreating(null);
              void actions.addComposition(id);
            }}
            onCancel={() => setCreating(null)}
          />
        ) : null}
        {compositions.length === 0 ? (
          <p className="text-muted-foreground px-3 py-2 text-xs">
            No compositions found. Add a{" "}
            <code className="font-mono">&lt;Composition&gt;</code> to your Root
            file.
          </p>
        ) : (
          compositions.map((composition) => (
            <CompositionRow
              key={composition.id}
              composition={composition}
              active={activeComposition?.id === composition.id}
            />
          ))
        )}
      </TabsContent>
      <TabsContent value="files" className="min-h-0 overflow-y-auto py-1">
        {creating === "file" ? (
          <InlineInput
            placeholder={`${directory}/NewComponent.tsx`}
            initialValue={`${directory}/`}
            onSubmit={(filePath) => {
              setCreating(null);
              const componentName = getFileName(filePath).replace(/\.\w+$/, "");
              actions.createFile(
                filePath,
                /\.tsx$/.test(filePath)
                  ? `import React from "react";
import { AbsoluteFill } from "remotion";

export const ${componentName}: React.FC = () => {
  return <AbsoluteFill />;
};
`
                  : "",
              );
            }}
            onCancel={() => setCreating(null)}
          />
        ) : null}
        {sortFilePaths(Object.keys(state.files)).map((filePath) => (
          <FileRow
            key={filePath}
            filePath={filePath}
            active={state.activeFile === filePath}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
};
