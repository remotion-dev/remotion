"use client";

import { getJsxNodeProps, type SequencePropUpdate } from "@remotion/codemods";
import { RotateCcwIcon } from "lucide-react";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
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
type PropStatus = ReturnType<typeof getJsxNodeProps>["props"][string];

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

const PropEditor: React.FC<{
  readonly fieldKey: string;
  readonly field: VisibleField["field"];
  readonly status: PropStatus | undefined;
  readonly onUpdate: (updates: SequencePropUpdate[]) => void;
  /** Shows a value on the canvas while it is being dragged. */
  readonly onPreview: (values: Record<string, unknown>) => void;
}> = ({ fieldKey, field, status, onUpdate, onPreview }) => {
  const label = getFieldLabel(fieldKey, field);
  const ariaLabel = label;
  const preview = (value: unknown) => onPreview({ [fieldKey]: value });

  if (status && status.status !== "static") {
    return (
      <FieldRow label={label}>
        <div className="text-muted-foreground-dim flex h-7 flex-1 items-center truncate font-mono text-[11px]">
          {status.status === "keyframed" ? "interpolate(…)" : "expression"}
        </div>
        <StatusBadge status={status.status} />
      </FieldRow>
    );
  }

  const codeValue = status?.status === "static" ? status.codeValue : undefined;
  const schemaDefault = "default" in field ? field.default : undefined;
  const defaultValue = schemaDefault === undefined ? null : schemaDefault;
  const isSet = codeValue !== undefined;
  const commit = (value: unknown) =>
    onUpdate([{ key: fieldKey, value, defaultValue }]);
  const reset = isSet ? (
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
  ) : (
    <span className="size-6 shrink-0" />
  );

  switch (field.type) {
    case "number": {
      const current = parseNumber(codeValue);
      return (
        <FieldRow label={label} badge={reset}>
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
          />
        </FieldRow>
      );
    }

    case "boolean":
      return (
        <FieldRow label={label} badge={reset}>
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
        <FieldRow label={label} badge={reset}>
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
          />
        </FieldRow>
      );
    }

    case "scale":
      return (
        <FieldRow label={label} badge={reset}>
          <NumberField
            ariaLabel={ariaLabel}
            value={parseScale(codeValue ?? schemaDefault)}
            min={field.min}
            max={field.max}
            step={field.step ?? 0.01}
            onCommit={(value) => commit(value ?? 1)}
            onLiveChange={preview}
          />
        </FieldRow>
      );

    case "rotation-css":
      return (
        <FieldRow label={label} badge={reset}>
          <NumberField
            ariaLabel={ariaLabel}
            value={parseRotation(codeValue ?? schemaDefault)}
            unit="°"
            step={field.step ?? 1}
            onCommit={(value) => commit(serializeRotation(value ?? 0))}
            onLiveChange={(value) => preview(serializeRotation(value))}
          />
        </FieldRow>
      );

    case "rotation-degrees":
      return (
        <FieldRow label={label} badge={reset}>
          <NumberField
            ariaLabel={ariaLabel}
            value={parseNumber(codeValue ?? schemaDefault) ?? 0}
            unit="°"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onCommit={(value) => commit(value ?? 0)}
            onLiveChange={preview}
          />
        </FieldRow>
      );

    case "color":
      return (
        <FieldRow label={label} badge={reset}>
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
        <FieldRow label={label} badge={reset} className="items-start">
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
        <FieldRow label={label} badge={reset}>
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
        <FieldRow label={label} badge={reset}>
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
        <FieldRow label={label} badge={reset}>
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
    let props: ReturnType<typeof getJsxNodeProps>["props"] | null = null;
    try {
      props = getJsxNodeProps({
        project,
        node,
        keys,
        videoConfig: composition
          ? {
              width: composition.width,
              height: composition.height,
              fps: composition.fps,
              durationInFrames: composition.durationInFrames,
            }
          : undefined,
      }).props;
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
          const extra = getJsxNodeProps({
            project,
            node,
            keys: variantFields.map((item) => item.key),
          }).props;
          props = { ...props, ...extra };
        } catch {
          // Leave the variant fields without status.
        }
      }
    }

    return { fields: visible, statuses: props };
  }, [composition, node, project, schema]);

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
              fieldKey={key}
              field={field}
              status={statuses?.[key]}
              onUpdate={onUpdate}
              onPreview={onPreview}
            />
          ))}
        </section>
      ))}
    </div>
  );
};
