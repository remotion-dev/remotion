"use client";

import { Internals } from "remotion";

import {
  getCanvasKeyframeSourceFrame,
  getCanvasKeyframeToggle,
  getCanvasPropValueAtFrame,
} from "@remotion/sdk";
import { getNodeProps, type SequencePropUpdate } from "@remotion/codemods";
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react";
import React, { useMemo } from "react";
import type {
  CanUpdateSequencePropStatus,
  InteractivitySchema,
} from "remotion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlaybackFrame } from "../../hooks/use-playback";
import { getFileName } from "../../model/project";
import {
  getLayerLabel,
  getNodeReference,
  type Layer,
} from "../../model/layers";
import {
  fieldGroupLabels,
  fieldGroupOrder,
  getFieldGroup,
  getFieldLabel,
  getLayerSchema,
  getVisibleFields,
  type FieldGroup,
} from "../../model/schemas";
import {
  parseNumber,
  parseRotation,
  parseScale,
  parseTranslate,
  serializeRotation,
  serializeTranslate,
} from "../../model/values";
import { useEditor } from "../../state/editor-context";
import { KeyframeDiamond } from "../KeyframeDiamond";
import { LayerActionBar } from "./LayerActions";
import {
  BooleanField,
  ColorField,
  FieldRow,
  NumberField,
  SelectField,
  StatusBadge,
  TextField,
} from "./fields";

type VisibleField = ReturnType<typeof getVisibleFields>[number];
type PropStatus = CanUpdateSequencePropStatus;

const keyframeNavButtonClass =
  "text-muted-foreground-dim hover:text-foreground disabled:hover:text-muted-foreground-dim flex h-5 w-2 items-center justify-center disabled:opacity-30";

/**
 * Previous / add-or-remove / next keyframe buttons of a prop. Only this leaf
 * follows the playhead, so the inspector does not re-render on every frame.
 */
const KeyframeControls: React.FC<{
  readonly layer: Layer;
  readonly fieldKey: string;
  readonly schema: InteractivitySchema;
  readonly status: CanUpdateSequencePropStatus;
}> = ({ layer, fieldKey, schema, status }) => {
  const { actions, playback, composition } = useEditor();
  const frame = usePlaybackFrame(playback);
  const toggle = getCanvasKeyframeToggle({
    nodePathInfo: layer.nodePathInfo,
    track: layer.track,
    schema,
    key: fieldKey,
    propStatus: status,
    frame,
    durationInFrames: composition?.durationInFrames ?? 1,
  });
  const keyframed = status.status === "keyframed";
  if (!keyframed && !toggle.keyframable) {
    return null;
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        className={cn(keyframeNavButtonClass, !keyframed && "invisible")}
        disabled={toggle.previousFrame === null}
        aria-label="Go to previous keyframe"
        onClick={() => {
          if (toggle.previousFrame !== null) {
            actions.seek(toggle.previousFrame);
          }
        }}
      >
        <ChevronLeftIcon className="size-2.5" />
      </button>
      <button
        type="button"
        className={cn(
          "flex size-4 items-center justify-center rounded disabled:opacity-30",
          toggle.hasKeyframe
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
        disabled={toggle.change === null}
        aria-label={toggle.hasKeyframe ? "Remove keyframe" : "Add keyframe"}
        title={
          toggle.hasKeyframe
            ? "Remove the keyframe at the playhead"
            : "Add a keyframe at the playhead"
        }
        onClick={() => {
          if (toggle.change !== null) {
            void actions.commitKeyframeChanges([toggle.change]);
          }
        }}
      >
        <KeyframeDiamond filled={toggle.hasKeyframe} />
      </button>
      <button
        type="button"
        className={cn(keyframeNavButtonClass, !keyframed && "invisible")}
        disabled={toggle.nextFrame === null}
        aria-label="Go to next keyframe"
        onClick={() => {
          if (toggle.nextFrame !== null) {
            actions.seek(toggle.nextFrame);
          }
        }}
      >
        <ChevronRightIcon className="size-2.5" />
      </button>
    </div>
  );
};

// Radix Select items cannot have an empty string as value.
const defaultOption = "__default__";

const fontWeights = [
  "normal",
  "bold",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

type PropFieldEditorProps = {
  readonly fieldKey: string;
  readonly field: VisibleField["field"];
  /** The value written in the source, or `undefined` when the prop is not set. */
  readonly codeValue: unknown;
  readonly badge: React.ReactNode;
  readonly keyframe: React.ReactNode;
  readonly onCommit: (value: unknown) => void;
  /** Shows a value on the canvas while it is being dragged. */
  readonly onPreview: (values: Record<string, unknown>) => void;
  readonly onCancelPreview: () => void;
};

const PropEditor: React.FC<{
  readonly layer: Layer;
  readonly schema: InteractivitySchema;
  readonly fieldKey: string;
  readonly field: VisibleField["field"];
  readonly status: PropStatus | undefined;
  readonly onUpdate: (updates: SequencePropUpdate[]) => void;
  readonly onPreview: (values: Record<string, unknown>) => void;
  readonly onCancelPreview: () => void;
}> = ({
  layer,
  schema,
  fieldKey,
  field,
  status,
  onUpdate,
  onPreview,
  onCancelPreview,
}) => {
  const label = getFieldLabel(fieldKey, field);

  if (status?.status === "computed") {
    return (
      <FieldRow label={label} keyframe={null}>
        <div className="text-muted-foreground-dim flex h-7 flex-1 items-center truncate font-mono text-[11px]">
          expression
        </div>
        <StatusBadge status="computed" />
      </FieldRow>
    );
  }

  const keyframe =
    status === undefined ? null : (
      <KeyframeControls
        layer={layer}
        fieldKey={fieldKey}
        schema={schema}
        status={status}
      />
    );

  if (status?.status === "keyframed") {
    return (
      <KeyframedPropEditor
        layer={layer}
        schema={schema}
        fieldKey={fieldKey}
        field={field}
        status={status}
        keyframe={keyframe}
        onPreview={onPreview}
        onCancelPreview={onCancelPreview}
      />
    );
  }

  const codeValue = status?.status === "static" ? status.codeValue : undefined;
  const schemaDefault = "default" in field ? field.default : undefined;
  const defaultValue = schemaDefault === undefined ? null : schemaDefault;
  const reset =
    codeValue === undefined ? (
      <span className="size-6 shrink-0" />
    ) : (
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Reset ${label}`}
        title="Reset to default"
        onClick={() =>
          onUpdate([{ key: fieldKey, value: undefined, defaultValue: null }])
        }
      >
        <RotateCcwIcon />
      </Button>
    );

  return (
    <PropFieldEditor
      fieldKey={fieldKey}
      field={field}
      codeValue={codeValue}
      badge={reset}
      keyframe={keyframe}
      onCommit={(value) => onUpdate([{ key: fieldKey, value, defaultValue }])}
      onPreview={onPreview}
      onCancelPreview={onCancelPreview}
    />
  );
};

/**
 * Edits an animated prop at the playhead: the field shows the interpolated
 * value of the current frame and committing a value writes a keyframe there.
 */
const KeyframedPropEditor: React.FC<{
  readonly layer: Layer;
  readonly schema: InteractivitySchema;
  readonly fieldKey: string;
  readonly field: VisibleField["field"];
  readonly status: Extract<PropStatus, { status: "keyframed" }>;
  readonly keyframe: React.ReactNode;
  readonly onPreview: (values: Record<string, unknown>) => void;
  readonly onCancelPreview: () => void;
}> = ({
  layer,
  schema,
  fieldKey,
  field,
  status,
  keyframe,
  onPreview,
  onCancelPreview,
}) => {
  const { actions, playback } = useEditor();
  const frame = usePlaybackFrame(playback);
  const value = getCanvasPropValueAtFrame({
    track: layer.track,
    schema,
    key: fieldKey,
    propStatus: status,
    frame,
  });

  return (
    <PropFieldEditor
      fieldKey={fieldKey}
      field={field}
      codeValue={value ?? undefined}
      badge={<StatusBadge status="keyframed" />}
      keyframe={keyframe}
      onCommit={(next) => {
        // A scrub that ends where it started only releases the preview.
        if (next === undefined || next === value) {
          onCancelPreview();
          return;
        }

        void actions.commitKeyframeChanges([
          {
            nodePathInfo: layer.nodePathInfo,
            key: fieldKey,
            schema,
            operation: {
              type: "add",
              frame: getCanvasKeyframeSourceFrame({
                track: layer.track,
                propStatus: status,
                frame,
              }),
              value: next,
            },
          },
        ]);
      }}
      onPreview={onPreview}
      onCancelPreview={onCancelPreview}
    />
  );
};

const PropFieldEditor: React.FC<PropFieldEditorProps> = ({
  fieldKey,
  field,
  codeValue,
  badge,
  keyframe,
  onCommit: commit,
  onPreview,
  onCancelPreview,
}) => {
  const label = getFieldLabel(fieldKey, field);
  const ariaLabel = label;
  const preview = (value: unknown) => onPreview({ [fieldKey]: value });
  const schemaDefault = "default" in field ? field.default : undefined;

  switch (field.type) {
    case "number": {
      const current = parseNumber(codeValue);
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <NumberField
            ariaLabel={ariaLabel}
            value={current}
            placeholder={
              typeof schemaDefault === "number" ? String(schemaDefault) : "auto"
            }
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            integer={field.integer}
            allowEmpty
            onCommit={(value) => commit(value === null ? undefined : value)}
            onLiveChange={preview}
            onCancel={onCancelPreview}
          />
        </FieldRow>
      );
    }

    case "boolean":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <BooleanField
            ariaLabel={ariaLabel}
            value={
              typeof codeValue === "boolean"
                ? codeValue
                : Boolean(schemaDefault)
            }
            onCommit={commit}
          />
        </FieldRow>
      );

    case "translate": {
      const current = parseTranslate(codeValue ?? schemaDefault);
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <NumberField
            ariaLabel={`${label} X`}
            value={current.x}
            unit="X"
            step={field.step ?? 1}
            onCommit={(x) =>
              commit(serializeTranslate({ x: x ?? 0, y: current.y }))
            }
            onLiveChange={(x) =>
              preview(serializeTranslate({ x, y: current.y }))
            }
            onCancel={onCancelPreview}
          />
          <NumberField
            ariaLabel={`${label} Y`}
            value={current.y}
            unit="Y"
            step={field.step ?? 1}
            onCommit={(y) =>
              commit(serializeTranslate({ x: current.x, y: y ?? 0 }))
            }
            onLiveChange={(y) =>
              preview(serializeTranslate({ x: current.x, y }))
            }
            onCancel={onCancelPreview}
          />
        </FieldRow>
      );
    }

    case "scale":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <NumberField
            ariaLabel={ariaLabel}
            value={parseScale(codeValue ?? schemaDefault)}
            min={field.min}
            max={field.max}
            step={field.step ?? 0.01}
            onCommit={(value) => commit(value ?? 1)}
            onLiveChange={preview}
            onCancel={onCancelPreview}
          />
        </FieldRow>
      );

    case "rotation-css":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <NumberField
            ariaLabel={ariaLabel}
            value={parseRotation(codeValue ?? schemaDefault)}
            unit="°"
            step={field.step ?? 1}
            onCommit={(value) => commit(serializeRotation(value ?? 0))}
            onLiveChange={(value) => preview(serializeRotation(value))}
            onCancel={onCancelPreview}
          />
        </FieldRow>
      );

    case "rotation-degrees":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <NumberField
            ariaLabel={ariaLabel}
            value={parseNumber(codeValue ?? schemaDefault) ?? 0}
            unit="°"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onCommit={(value) => commit(value ?? 0)}
            onLiveChange={preview}
            onCancel={onCancelPreview}
          />
        </FieldRow>
      );

    case "color":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <ColorField
            ariaLabel={ariaLabel}
            value={typeof codeValue === "string" ? codeValue : ""}
            placeholder={
              typeof schemaDefault === "string" ? schemaDefault : undefined
            }
            onCommit={(value) => commit(value === "" ? undefined : value)}
            onLiveChange={preview}
          />
        </FieldRow>
      );

    case "text-content":
      return (
        <FieldRow
          label={label}
          badge={badge}
          keyframe={keyframe}
          className="items-start"
        >
          <TextField
            ariaLabel={ariaLabel}
            multiline
            value={typeof codeValue === "string" ? codeValue : ""}
            placeholder="Text"
            onCommit={commit}
          />
        </FieldRow>
      );

    case "font-weight":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <SelectField
            ariaLabel={ariaLabel}
            value={codeValue === undefined ? defaultOption : String(codeValue)}
            options={[
              { value: defaultOption, label: "Default" },
              ...fontWeights.map((weight) => ({
                value: weight,
                label: weight,
              })),
            ]}
            onCommit={(value) =>
              commit(
                value === defaultOption
                  ? undefined
                  : /^\d+$/.test(value)
                    ? Number(value)
                    : value,
              )
            }
          />
        </FieldRow>
      );

    case "enum":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <SelectField
            ariaLabel={ariaLabel}
            value={
              typeof codeValue === "string" ? codeValue : String(field.default)
            }
            options={Object.keys(field.variants).map((variant) => ({
              value: variant,
              label: variant,
            }))}
            onCommit={commit}
          />
        </FieldRow>
      );

    case "font-family":
    case "transform-origin":
    case "asset":
      return (
        <FieldRow label={label} badge={badge} keyframe={keyframe}>
          <TextField
            ariaLabel={ariaLabel}
            mono={field.type === "asset"}
            value={typeof codeValue === "string" ? codeValue : ""}
            placeholder={
              typeof schemaDefault === "string" ? schemaDefault : undefined
            }
            onCommit={(value) => commit(value === "" ? undefined : value)}
          />
        </FieldRow>
      );

    default:
      return null;
  }
};

export const LayerInspector: React.FC<{ readonly layer: Layer }> = ({
  layer,
}) => {
  const { project, actions, composition } = useEditor();
  const node = getNodeReference(layer.selectionItem);
  const source = layer.source;
  const schema = getLayerSchema(layer);
  const displayName = layer.track.sequence.displayName;
  const label = getLayerLabel(layer);

  const { fields, statuses } = useMemo(() => {
    if (!node || !schema) {
      return { fields: [] as VisibleField[], statuses: null };
    }

    let visible = getVisibleFields(schema);
    const keys = visible.map(({ key }) => key);
    let props: Record<string, CanUpdateSequencePropStatus> | null = null;
    try {
      props = Internals.evaluateSourcePropStatuses(getNodeProps({
        project,
        node,
        keys,
      }).props, layer.track.sequence.controls?.videoConfigValues ?? composition ?? null);
    } catch {
      return { fields: visible, statuses: null };
    }

    // Enum variants (e.g. Sequence layout="absolute-fill") unlock more fields.
    for (const { key, field } of visible) {
      if (field.type !== "enum") continue;
      const status = props[key];
      const current =
        status?.status === "static" && typeof status.codeValue === "string"
          ? status.codeValue
          : field.default;
      const variantFields = getVisibleFields(field.variants[current] ?? {});
      if (variantFields.length > 0) {
        visible = [...visible, ...variantFields];
        try {
          const extra = Internals.evaluateSourcePropStatuses(getNodeProps({
            project,
            node,
            keys: variantFields.map((item) => item.key),
          }).props, layer.track.sequence.controls?.videoConfigValues ?? composition ?? null);
          props = { ...props, ...extra };
        } catch {
          // Leave the variant fields without status.
        }
      }
    }

    return { fields: visible, statuses: props };
  }, [composition, node, project, schema, layer.track.sequence.controls?.videoConfigValues]);

  const grouped = useMemo(() => {
    const groups = new Map<FieldGroup, VisibleField[]>();
    for (const item of fields) {
      const group = getFieldGroup(item.key);
      groups.set(group, [...(groups.get(group) ?? []), item]);
    }

    return fieldGroupOrder
      .filter((group) => groups.has(group))
      .map((group) => ({ group, items: groups.get(group)! }));
  }, [fields]);

  const onUpdate = (updates: SequencePropUpdate[]) => {
    if (node) {
      void actions.commitLayerProps(layer, updates, schema);
    }
  };
  const onPreview = (values: Record<string, unknown>) => {
    actions.previewLayerProps(layer, values);
  };

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]">
            {source?.tagName ?? layer.track.sequence.type}
          </span>
          {source ? (
            <button
              type="button"
              className="text-muted-foreground-dim hover:text-primary ml-auto truncate font-mono text-[10px]"
              onClick={() =>
                actions.reveal(
                  source.filePath,
                  source.location?.line ?? null,
                  source.location?.column ?? null,
                )
              }
            >
              {getFileName(source.filePath)}
              {source.location ? `:${source.location.line}` : ""}
            </button>
          ) : null}
        </div>
        {node ? (
          <TextField
            ariaLabel="Layer name"
            value={displayName.startsWith("<") ? "" : displayName}
            placeholder={label}
            onCommit={(name) => void actions.renameNode(node, name)}
          />
        ) : (
          <div className="text-sm font-medium">{label}</div>
        )}
      </div>
      {source ? (
        <LayerActionBar layer={layer} />
      ) : (
        <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-[11px] leading-relaxed">
          This layer is not linked to a JSX element in the source code, so it
          cannot be edited here. Elements rendered by dependencies do not carry
          a source location.
        </p>
      )}
      {source && !schema ? (
        <p className="text-muted-foreground bg-muted/50 rounded-md p-2 text-[11px] leading-relaxed">
          <code className="font-mono">&lt;{source.tagName}&gt;</code> is a
          custom component. Its props are edited in the code — use “Reveal in
          code” to jump there.
        </p>
      ) : null}
      {grouped.map(({ group, items }) => (
        <section key={group} className="flex flex-col gap-2">
          <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
            {fieldGroupLabels[group]}
          </h3>
          {items.map(({ key, field }) => (
            <PropEditor
              key={key}
              layer={layer}
              schema={schema ?? {}}
              fieldKey={key}
              field={field}
              status={statuses?.[key]}
              onUpdate={onUpdate}
              onPreview={onPreview}
              onCancelPreview={() => actions.cancelLayerPreview(layer)}
            />
          ))}
        </section>
      ))}
    </div>
  );
};
