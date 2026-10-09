"use client";

import {
  ClapperboardIcon,
  CodeIcon,
  KeyboardIcon,
  PanelBottomIcon,
  PanelLeftIcon,
  PanelRightIcon,
  Redo2Icon,
  SaveIcon,
  Undo2Icon,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEditor } from "../state/editor-context";
import { hasUnsavedChanges } from "../state/editor-store";

export const ToolbarButton: React.FC<{
  readonly label: string;
  readonly shortcut?: string;
  readonly onClick: () => void;
  readonly pressed?: boolean;
  readonly disabled?: boolean;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly size?: "icon-sm" | "icon-xs";
}> = ({
  label,
  shortcut,
  onClick,
  pressed,
  disabled,
  children,
  className,
  size = "icon-sm",
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size={size}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={className}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      {label}
      {shortcut ? (
        <span className="text-muted-foreground ml-2 font-mono text-[10px]">
          {shortcut}
        </span>
      ) : null}
    </TooltipContent>
  </Tooltip>
);

const CompileStatus: React.FC = () => {
  const { state } = useEditor();
  const { compile, runtimeError, warnings } = state;
  const label =
    runtimeError !== null && compile.type === "ready"
      ? "Runtime error"
      : compile.type === "booting"
        ? compile.message
        : compile.type === "compiling"
          ? "Compiling…"
          : compile.type === "ready"
            ? warnings.length > 0
              ? `Ready · ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`
              : "Ready"
            : "Compilation failed";
  const tone =
    compile.type === "error" ||
    (runtimeError !== null && compile.type === "ready")
      ? "error"
      : compile.type === "ready"
        ? warnings.length > 0
          ? "warning"
          : "ok"
        : "busy";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px]",
        tone === "error" &&
          "border-destructive/40 bg-destructive/10 text-destructive-foreground",
        tone === "ok" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
        tone === "busy" && "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "error" && "bg-destructive",
          tone === "ok" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "busy" && "bg-muted-foreground animate-pulse",
        )}
      />
      {label}
    </div>
  );
};

export const TopBar: React.FC = () => {
  const { state, actions, compositions, activeComposition, canSave } =
    useEditor();
  const unsaved = hasUnsavedChanges(state);

  return (
    <header className="bg-background-elevated border-border flex h-11 shrink-0 items-center gap-2 border-b px-3">
      <div className="flex items-center gap-2 pr-2">
        <div className="bg-primary flex size-6 items-center justify-center rounded-md">
          <ClapperboardIcon className="size-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Vibe Code</span>
      </div>
      <div className="bg-border h-5 w-px" />
      <Select
        value={activeComposition?.id ?? ""}
        onValueChange={(id) => actions.selectComposition(id)}
      >
        <SelectTrigger
          size="sm"
          aria-label="Composition"
          className="min-w-[180px] border-transparent bg-transparent font-medium hover:bg-accent"
        >
          <SelectValue placeholder="No composition" />
        </SelectTrigger>
        <SelectContent align="start">
          {compositions.map((composition) => (
            <SelectItem key={composition.id} value={composition.id}>
              {composition.id}
              <span className="text-muted-foreground ml-1 text-[10px]">
                {composition.width}×{composition.height}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex-1" />
      <CompileStatus />
      <div className="flex-1" />
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          label="Undo"
          shortcut="⌘Z"
          onClick={actions.undo}
          disabled={state.past.length === 0}
        >
          <Undo2Icon />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          shortcut="⌘⇧Z"
          onClick={actions.redo}
          disabled={state.future.length === 0}
        >
          <Redo2Icon />
        </ToolbarButton>
        <ToolbarButton
          label={
            canSave
              ? unsaved
                ? "Save to src/remotion"
                : "All changes saved"
              : "Saving is only available in development"
          }
          shortcut="⌘S"
          onClick={() => void actions.save()}
          disabled={!canSave || !unsaved}
          className="relative"
        >
          <SaveIcon />
          {unsaved ? (
            <span className="bg-warning absolute top-1 right-1 size-1.5 rounded-full" />
          ) : null}
        </ToolbarButton>
      </div>
      <div className="bg-border mx-1 h-5 w-px" />
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          label="Toggle sidebar"
          shortcut="⌘B"
          onClick={actions.toggleSidebar}
          pressed={state.layout.showSidebar}
        >
          <PanelLeftIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Toggle code editor"
          shortcut="⌘E"
          onClick={actions.toggleCode}
          pressed={state.layout.showCode}
        >
          <CodeIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Toggle timeline"
          shortcut="⌘."
          onClick={actions.toggleTimeline}
          pressed={state.layout.showTimeline}
        >
          <PanelBottomIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Toggle inspector"
          shortcut="⌘J"
          onClick={actions.toggleInspector}
          pressed={state.layout.showInspector}
        >
          <PanelRightIcon />
        </ToolbarButton>
        <ToolbarButton
          label="Keyboard shortcuts"
          shortcut="?"
          onClick={() => actions.openDialog("shortcuts")}
        >
          <KeyboardIcon />
        </ToolbarButton>
      </div>
      <div className="bg-border mx-1 h-5 w-px" />
      <Button
        size="sm"
        onClick={() => actions.openDialog("render")}
        disabled={!activeComposition}
      >
        Render
      </Button>
    </header>
  );
};
