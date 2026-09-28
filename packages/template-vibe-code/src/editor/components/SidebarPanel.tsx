"use client";

import type {
  CompositionDestination,
  CompositionTreeItem,
} from "@remotion/codemods";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCode2Icon,
  FileIcon,
  FilmIcon,
  FolderIcon,
  FolderPlusIcon,
  ImageIcon,
  PlusIcon,
} from "lucide-react";
import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROJECT_DIR } from "@/lib/project-paths";
import { cn } from "@/lib/utils";
import {
  getFolderPath,
  toCompositionTreeItem,
  toFolderReference,
  type FolderInfo,
  type RegistrationTreeItem,
} from "../model/compositions";
import { getFileName, sortFilePaths } from "../model/project";
import { useEditor } from "../state/editor-context";
import { ToolbarButton } from "./TopBar";

const InlineInput: React.FC<{
  readonly placeholder: string;
  readonly initialValue?: string;
  readonly indent?: number;
  readonly onSubmit: (value: string) => void;
  readonly onCancel: () => void;
}> = ({ placeholder, initialValue = "", indent = 0, onSubmit, onCancel }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      className="py-1 pr-2"
      style={{ paddingLeft: 8 + indent }}
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

/** A registration being created, inside the folder `parentName` or at the root. */
type CreatingRegistration = {
  type: "composition" | "folder";
  parentName: string | null;
};

type Creating = CreatingRegistration | { type: "file" };

type DropPosition = "before" | "after" | "inside";

type DropTarget = { key: string; position: DropPosition };

const getItemKey = (item: RegistrationTreeItem) =>
  item.type === "composition"
    ? `composition:${item.composition.id}`
    : `folder:${getFolderPath(item.folder)}`;

const getItemParentName = (item: RegistrationTreeItem) =>
  item.type === "composition"
    ? item.composition.folderPath
    : item.folder.parentName;

/** Whether `folderPath` is the folder `candidate` or one of its descendants. */
const isInsideFolder = (
  folderPath: string | null,
  candidate: RegistrationTreeItem,
) =>
  candidate.type === "folder" &&
  folderPath !== null &&
  (folderPath === getFolderPath(candidate.folder) ||
    folderPath.startsWith(`${getFolderPath(candidate.folder)}/`));

const getDropDestination = (
  target: RegistrationTreeItem,
  position: DropPosition,
): CompositionDestination => {
  if (position === "inside" && target.type === "folder") {
    return {
      type: "folder",
      folder: {
        name: target.folder.name,
        parentName: target.folder.parentName,
      },
    };
  }

  return {
    type: position === "before" ? "before" : "after",
    target: toCompositionTreeItem(target),
  };
};

type TreeContext = {
  readonly dragging: RegistrationTreeItem | null;
  readonly dropTarget: DropTarget | null;
  readonly collapsed: ReadonlySet<string>;
  readonly creating: CreatingRegistration | null;
  readonly setDragging: (item: RegistrationTreeItem | null) => void;
  readonly setDropTarget: (target: DropTarget | null) => void;
  readonly toggleCollapsed: (folderPath: string) => void;
  readonly setCreating: (creating: CreatingRegistration | null) => void;
  readonly move: (
    item: CompositionTreeItem,
    destination: CompositionDestination,
  ) => void;
};

const MoveToMenu: React.FC<{
  readonly item: RegistrationTreeItem;
  readonly folders: FolderInfo[];
  readonly onMove: (destination: CompositionDestination) => void;
}> = ({ item, folders, onMove }) => {
  const parentName = getItemParentName(item);
  const destinations = folders.filter(
    (folder) =>
      getFolderPath(folder) !== parentName &&
      !isInsideFolder(getFolderPath(folder), item),
  );

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem
          disabled={parentName === null}
          onSelect={() => onMove({ type: "root" })}
        >
          Root
        </ContextMenuItem>
        {destinations.length > 0 ? <ContextMenuSeparator /> : null}
        {destinations.map((folder) => (
          <ContextMenuItem
            key={getFolderPath(folder)}
            onSelect={() =>
              onMove({
                type: "folder",
                folder: { name: folder.name, parentName: folder.parentName },
              })
            }
          >
            <FolderIcon className="opacity-70" />
            {getFolderPath(folder)}
          </ContextMenuItem>
        ))}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
};

/**
 * Drag handlers of a tree row. Dropping on the upper or lower edge inserts
 * beside the row, dropping on the middle of a folder moves into it. Rows stop
 * the events so the root drop zone only reacts to the space below them.
 */
const getRowDragProps = (item: RegistrationTreeItem, tree: TreeContext) => {
  const key = getItemKey(item);
  const dropPosition =
    tree.dropTarget?.key === key ? tree.dropTarget.position : null;

  const getPosition = (event: React.DragEvent): DropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    if (item.type === "folder") {
      return ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "inside";
    }

    return ratio < 0.5 ? "before" : "after";
  };

  // An item cannot be dropped on itself or inside its own folder subtree.
  const canDrop = () =>
    tree.dragging !== null &&
    getItemKey(tree.dragging) !== key &&
    !isInsideFolder(
      item.type === "folder"
        ? getFolderPath(item.folder)
        : item.composition.folderPath,
      tree.dragging,
    );

  return {
    dropPosition,
    props: {
      draggable: true,
      onDragStart: (event: React.DragEvent) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
          "text/plain",
          item.type === "composition" ? item.composition.id : item.folder.name,
        );
        tree.setDragging(item);
      },
      onDragEnd: () => {
        tree.setDragging(null);
        tree.setDropTarget(null);
      },
      onDragOver: (event: React.DragEvent) => {
        event.stopPropagation();
        if (!canDrop()) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        const position = getPosition(event);
        if (dropPosition !== position) {
          tree.setDropTarget({ key, position });
        }
      },
      onDragLeave: (event: React.DragEvent) => {
        if (
          dropPosition !== null &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          tree.setDropTarget(null);
        }
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        const { dragging } = tree;
        tree.setDragging(null);
        tree.setDropTarget(null);
        if (dragging && canDrop()) {
          tree.move(
            toCompositionTreeItem(dragging),
            getDropDestination(item, getPosition(event)),
          );
        }
      },
    },
  };
};

const rowClassName =
  "relative flex w-full items-center gap-2 py-1.5 pr-3 text-left text-xs outline-none";

const DropIndicator: React.FC<{ readonly position: DropPosition | null }> = ({
  position,
}) =>
  position === "before" || position === "after" ? (
    <span
      aria-hidden
      className={cn(
        "bg-primary pointer-events-none absolute inset-x-2 h-px",
        position === "before" ? "top-0" : "bottom-0",
      )}
    />
  ) : null;

const CompositionRow: React.FC<{
  readonly item: Extract<RegistrationTreeItem, { type: "composition" }>;
  readonly level: number;
  readonly tree: TreeContext;
}> = ({ item, level, tree }) => {
  const { actions, compositions, registrations, activeComposition } =
    useEditor();
  const [renaming, setRenaming] = useState(false);
  const { composition } = item;
  const { dropPosition, props: dragProps } = getRowDragProps(item, tree);
  const active = activeComposition?.id === composition.id;

  if (renaming) {
    return (
      <InlineInput
        placeholder="Composition ID"
        initialValue={composition.id}
        indent={level * 14}
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
          style={{ paddingLeft: 12 + level * 14 }}
          className={cn(
            rowClassName,
            active
              ? "bg-selection-dim/60 text-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
          {...dragProps}
        >
          <DropIndicator position={dropPosition} />
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
        <MoveToMenu
          item={item}
          folders={registrations.folders}
          onMove={(destination) =>
            tree.move(toCompositionTreeItem(item), destination)
          }
        />
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

const FolderRow: React.FC<{
  readonly item: Extract<RegistrationTreeItem, { type: "folder" }>;
  readonly level: number;
  readonly tree: TreeContext;
}> = ({ item, level, tree }) => {
  const { actions, registrations } = useEditor();
  const [renaming, setRenaming] = useState(false);
  const { folder } = item;
  const folderPath = getFolderPath(folder);
  const expanded = !tree.collapsed.has(folderPath);
  const { dropPosition, props: dragProps } = getRowDragProps(item, tree);

  const row = renaming ? (
    <InlineInput
      placeholder="Folder name"
      initialValue={folder.name}
      indent={level * 14}
      onSubmit={(newName) => {
        setRenaming(false);
        void actions.renameFolder(
          { name: folder.name, parentName: folder.parentName },
          newName,
        );
      }}
      onCancel={() => setRenaming(false)}
    />
  ) : (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => tree.toggleCollapsed(folderPath)}
          onDoubleClick={() => setRenaming(true)}
          style={{ paddingLeft: 12 + level * 14 }}
          className={cn(
            rowClassName,
            "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            dropPosition === "inside" && "bg-selection-dim/40 text-foreground",
          )}
          {...dragProps}
        >
          <DropIndicator position={dropPosition} />
          {expanded ? (
            <ChevronDownIcon className="-ml-1 size-3 shrink-0 opacity-60" />
          ) : (
            <ChevronRightIcon className="-ml-1 size-3 shrink-0 opacity-60" />
          )}
          <FolderIcon className="size-3.5 shrink-0 opacity-70" />
          <span className="min-w-0 flex-1 truncate font-medium">
            {folder.name}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() =>
            tree.setCreating({ type: "composition", parentName: folderPath })
          }
        >
          New composition
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() =>
            tree.setCreating({ type: "folder", parentName: folderPath })
          }
        >
          New folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => setRenaming(true)}>
          Rename
        </ContextMenuItem>
        <MoveToMenu
          item={item}
          folders={registrations.folders}
          onMove={(destination) =>
            tree.move(toCompositionTreeItem(item), destination)
          }
        />
        <ContextMenuItem
          onSelect={() => actions.reveal(folder.filePath, folder.line, null)}
        >
          Reveal in code
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          onSelect={() =>
            void actions.deleteFolder({
              name: folder.name,
              parentName: folder.parentName,
            })
          }
        >
          Delete folder, keep contents
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <>
      {row}
      {expanded ? (
        <TreeItems
          items={item.children}
          parentName={folderPath}
          level={level + 1}
          tree={tree}
        />
      ) : null}
    </>
  );
};

const TreeItems: React.FC<{
  readonly items: RegistrationTreeItem[];
  /** The folder the items are in, `null` at the root. */
  readonly parentName: string | null;
  readonly level: number;
  readonly tree: TreeContext;
}> = ({ items, parentName, level, tree }) => {
  const { actions } = useEditor();
  const { creating } = tree;

  return (
    <>
      {items.map((item) =>
        item.type === "composition" ? (
          <CompositionRow
            key={getItemKey(item)}
            item={item}
            level={level}
            tree={tree}
          />
        ) : (
          <FolderRow
            key={getItemKey(item)}
            item={item}
            level={level}
            tree={tree}
          />
        ),
      )}
      {creating !== null && creating.parentName === parentName ? (
        <InlineInput
          placeholder={
            creating.type === "composition"
              ? "New composition ID"
              : "New folder name"
          }
          indent={level * 14}
          onSubmit={(value) => {
            tree.setCreating(null);
            if (creating.type === "composition") {
              void actions.addComposition(
                value,
                parentName === null ? null : toFolderReference(parentName),
              );
            } else {
              void actions.addFolder(value, parentName);
            }
          }}
          onCancel={() => tree.setCreating(null)}
        />
      ) : null}
    </>
  );
};

const RegistrationTree: React.FC<{
  readonly creating: CreatingRegistration | null;
  readonly setCreating: (creating: CreatingRegistration | null) => void;
}> = ({ creating, setCreating }) => {
  const { actions, registrations } = useEditor();
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [dragging, setDragging] = useState<RegistrationTreeItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const tree: TreeContext = {
    dragging,
    dropTarget,
    collapsed,
    creating,
    setDragging,
    setDropTarget,
    setCreating,
    toggleCollapsed: (folderPath) =>
      setCollapsed((previous) => {
        const next = new Set(previous);
        if (!next.delete(folderPath)) {
          next.add(folderPath);
        }

        return next;
      }),
    move: (item, destination) =>
      void actions.moveRegistration(item, destination),
  };
  const rootDrop = dropTarget?.key === "root";

  if (registrations.tree.length === 0 && creating === null) {
    return (
      <p className="text-muted-foreground px-3 py-2 text-xs">
        No compositions found. Add a{" "}
        <code className="font-mono">&lt;Composition&gt;</code> to your Root
        file.
      </p>
    );
  }

  return (
    // The area below the rows accepts drops to move an item to the root.
    <div
      className={cn(
        "flex min-h-full flex-col pb-6",
        rootDrop && "bg-selection-dim/20",
      )}
      onDragOver={(event) => {
        if (dragging === null || getItemParentName(dragging) === null) {
          return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (!rootDrop) {
          setDropTarget({ key: "root", position: "inside" });
        }
      }}
      onDragLeave={(event) => {
        if (
          rootDrop &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          setDropTarget(null);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDropTarget(null);
        setDragging(null);
        if (dragging !== null && getItemParentName(dragging) !== null) {
          tree.move(toCompositionTreeItem(dragging), { type: "root" });
        }
      }}
    >
      <TreeItems
        items={registrations.tree}
        parentName={null}
        level={0}
        tree={tree}
      />
    </div>
  );
};

const FileRow: React.FC<{
  readonly filePath: string;
  readonly active: boolean;
}> = ({ filePath, active }) => {
  const { actions, entryPoint } = useEditor();
  const [renaming, setRenaming] = useState(false);
  // The entry point calls registerRoot(); without it nothing compiles.
  const isEntry = filePath === entryPoint;

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
          onDoubleClick={() => {
            if (!isEntry) {
              setRenaming(true);
            }
          }}
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
        <ContextMenuItem disabled={isEntry} onSelect={() => setRenaming(true)}>
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
  const { state, dispatch, actions } = useEditor();
  const [creating, setCreating] = useState<Creating | null>(null);
  const compositionsTab = state.layout.sidebarTab === "compositions";

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
        {compositionsTab ? (
          <ToolbarButton
            size="icon-xs"
            label="New folder"
            onClick={() => setCreating({ type: "folder", parentName: null })}
            className="mb-1"
          >
            <FolderPlusIcon />
          </ToolbarButton>
        ) : null}
        <ToolbarButton
          size="icon-xs"
          label={compositionsTab ? "New composition" : "New file"}
          onClick={() =>
            setCreating(
              compositionsTab
                ? { type: "composition", parentName: null }
                : { type: "file" },
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
        <RegistrationTree
          creating={
            creating !== null && creating.type !== "file" ? creating : null
          }
          setCreating={setCreating}
        />
      </TabsContent>
      <TabsContent value="files" className="min-h-0 overflow-y-auto py-1">
        {creating?.type === "file" ? (
          <InlineInput
            placeholder={`${PROJECT_DIR}/NewComponent.tsx`}
            initialValue={`${PROJECT_DIR}/`}
            onSubmit={(filePath) => {
              setCreating(null);
              actions.createFile(filePath);
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
