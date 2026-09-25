"use client";

import type { CodemodValue } from "@remotion/codemods";
import { CopyIcon, CodeIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getFileName } from "../../model/project";
import { useEditor } from "../../state/editor-context";
import { ToolbarButton } from "../TopBar";
import { AddLayerMenu } from "./LayerActions";
import { FieldRow, NumberField, TextField } from "./fields";

export const CompositionInspector: React.FC = () => {
  const { activeComposition, composition, compositions, actions, state } =
    useEditor();
  const [propsDraft, setPropsDraft] = useState<string | null>(null);
  const [propsError, setPropsError] = useState<string | null>(null);

  const effectiveProps = useMemo(
    () => ({
      ...(activeComposition?.defaultProps ?? {}),
      ...(state.propsOverride ?? {}),
    }),
    [activeComposition?.defaultProps, state.propsOverride],
  );
  const propsJson = useMemo(
    () => JSON.stringify(effectiveProps, null, 2),
    [effectiveProps],
  );
  useEffect(() => {
    setPropsDraft(null);
    setPropsError(null);
  }, [propsJson]);

  if (!activeComposition) {
    return (
      <div className="text-muted-foreground p-3 text-xs">
        No composition selected.
      </div>
    );
  }

  const id = activeComposition.id;
  const isStill = activeComposition.tagName === "Still";
  const metadataIsStatic =
    activeComposition.width !== null && activeComposition.height !== null;
  const parseDraft = (): Record<string, CodemodValue> | null => {
    try {
      const parsed: unknown = JSON.parse(propsDraft ?? propsJson);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        throw new Error("Props must be a JSON object.");
      }

      setPropsError(null);
      return parsed as Record<string, CodemodValue>;
    } catch (error) {
      setPropsError(error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
            {activeComposition.tagName}
          </span>
          <button
            type="button"
            className="text-muted-foreground-dim hover:text-primary ml-auto truncate font-mono text-[10px]"
            onClick={() =>
              actions.reveal(
                activeComposition.filePath,
                activeComposition.line,
                null,
              )
            }
          >
            {getFileName(activeComposition.filePath)}
            {activeComposition.line ? `:${activeComposition.line}` : ""}
          </button>
        </div>
        <TextField
          ariaLabel="Composition ID"
          value={id}
          mono
          onCommit={(newId) => void actions.renameComposition(id, newId)}
        />
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label="Reveal in code"
            onClick={() =>
              actions.reveal(
                activeComposition.filePath,
                activeComposition.line,
                null,
              )
            }
          >
            <CodeIcon />
          </ToolbarButton>
          <ToolbarButton
            label="Duplicate composition"
            onClick={() => void actions.duplicateComposition(id)}
          >
            <CopyIcon />
          </ToolbarButton>
          <span className="flex-1" />
          <AddLayerMenu />
          <ToolbarButton
            label="Delete composition"
            onClick={() => void actions.deleteComposition(id)}
            disabled={compositions.length <= 1}
            className="hover:text-destructive-foreground"
          >
            <Trash2Icon />
          </ToolbarButton>
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
          Metadata
        </h3>
        {!metadataIsStatic ? (
          <p className="text-muted-foreground text-[11px]">
            The dimensions are computed (for example via{" "}
            <code className="font-mono">calculateMetadata</code>) and can only
            be changed in the code.
          </p>
        ) : null}
        <FieldRow label="Width">
          <NumberField
            ariaLabel="Width"
            value={activeComposition.width}
            min={1}
            integer
            unit="px"
            disabled={!metadataIsStatic}
            onCancel={null}
            onCommit={(width) =>
              width !== null &&
              void actions.updateCompositionMetadata(id, { width })
            }
          />
        </FieldRow>
        <FieldRow label="Height">
          <NumberField
            ariaLabel="Height"
            value={activeComposition.height}
            min={1}
            integer
            unit="px"
            disabled={!metadataIsStatic}
            onCancel={null}
            onCommit={(height) =>
              height !== null &&
              void actions.updateCompositionMetadata(id, { height })
            }
          />
        </FieldRow>
        {!isStill ? (
          <>
            <FieldRow label="FPS">
              <NumberField
                ariaLabel="Frames per second"
                value={activeComposition.fps}
                min={1}
                max={240}
                disabled={activeComposition.fps === null}
                onCancel={null}
                onCommit={(fps) =>
                  fps !== null &&
                  void actions.updateCompositionMetadata(id, { fps })
                }
              />
            </FieldRow>
            <FieldRow label="Duration">
              <NumberField
                ariaLabel="Duration in frames"
                value={activeComposition.durationInFrames}
                min={1}
                integer
                unit="f"
                disabled={activeComposition.durationInFrames === null}
                onCancel={null}
                onCommit={(durationInFrames) =>
                  durationInFrames !== null &&
                  void actions.updateCompositionMetadata(id, {
                    durationInFrames,
                  })
                }
              />
            </FieldRow>
            {activeComposition.durationInFrames !== null &&
            activeComposition.fps ? (
              <div className="text-muted-foreground-dim -mt-1 pl-[96px] font-mono text-[10px]">
                {(
                  activeComposition.durationInFrames / activeComposition.fps
                ).toFixed(2)}
                s
                {composition &&
                composition.durationInFrames !==
                  activeComposition.durationInFrames
                  ? ` · resolved: ${composition.durationInFrames}f`
                  : ""}
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center">
          <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
            Props
          </h3>
          {state.propsOverride ? (
            <span className="bg-warning/15 text-warning ml-2 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase">
              unsaved override
            </span>
          ) : null}
        </div>
        <textarea
          aria-label="Composition props (JSON)"
          spellCheck={false}
          className="bg-input border-border focus-visible:border-ring min-h-[120px] w-full resize-y rounded-md border px-2 py-1.5 font-mono text-[11px] leading-relaxed outline-none"
          value={propsDraft ?? propsJson}
          onChange={(event) => setPropsDraft(event.target.value)}
        />
        {propsError ? (
          <p className="text-destructive-foreground text-[11px]">
            {propsError}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="xs"
            variant="secondary"
            disabled={propsDraft === null}
            onClick={() => {
              const parsed = parseDraft();
              if (parsed) {
                actions.setPropsOverride(parsed);
              }
            }}
          >
            Preview
          </Button>
          <Button
            size="xs"
            disabled={
              activeComposition.defaultProps === null ||
              (propsDraft === null && state.propsOverride === null)
            }
            title={
              activeComposition.defaultProps === null
                ? "defaultProps must be an inline object to be saved"
                : "Write these props as defaultProps into the code"
            }
            onClick={() => {
              const parsed = parseDraft();
              if (parsed) {
                void actions.setDefaultProps(id, parsed).then((ok) => {
                  if (ok) {
                    actions.setPropsOverride(null);
                  }
                });
              }
            }}
          >
            Save as defaultProps
          </Button>
          <Button
            size="xs"
            variant="ghost"
            disabled={propsDraft === null && state.propsOverride === null}
            onClick={() => {
              setPropsDraft(null);
              setPropsError(null);
              actions.setPropsOverride(null);
            }}
          >
            Reset
          </Button>
        </div>
        <p className="text-muted-foreground-dim text-[10px] leading-relaxed">
          “Preview” passes the props to the composition without touching the
          code. “Save as defaultProps” writes them into{" "}
          <code className="font-mono">&lt;Composition defaultProps&gt;</code>.
        </p>
      </section>
    </div>
  );
};
