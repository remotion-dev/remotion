"use client";

import {
  canvasKeyframeEasingPresets,
  getCanvasKeyframeSettings,
  getCanvasKeyframeSettingsChange,
  type CanvasKeyframeEasing,
  type CanvasKeyframeSettings,
} from "@remotion/sdk";
import { ChevronLeftIcon } from "lucide-react";
import React, { useState } from "react";
import type { ExtrapolateType, InterpolateOutputOption } from "remotion";
import { cn } from "@/lib/utils";
import {
  findKeyframedProp,
  getEasingChanges,
  type EasingSelectionItem,
  type KeyframedProp,
} from "../../model/keyframes";
import { getLayerLabel } from "../../model/layers";
import { getFieldLabel } from "../../model/schemas";
import { useEditor } from "../../state/editor-context";
import { EasingCurve } from "../EasingCurve";
import { BooleanField, FieldRow, NumberField, SelectField } from "./fields";

type BezierEasing = Extract<CanvasKeyframeEasing, { type: "bezier" }>;
type SpringEasing = Extract<CanvasKeyframeEasing, { type: "spring" }>;

export const areEasingsEqual = (
  first: CanvasKeyframeEasing,
  second: CanvasKeyframeEasing,
): boolean => {
  switch (first.type) {
    case "linear":
    case "step1":
      return first.type === second.type;
    case "bezier":
      return (
        second.type === "bezier" &&
        first.x1 === second.x1 &&
        first.y1 === second.y1 &&
        first.x2 === second.x2 &&
        first.y2 === second.y2
      );
    case "spring":
      return (
        second.type === "spring" &&
        first.damping === second.damping &&
        first.mass === second.mass &&
        first.stiffness === second.stiffness &&
        first.overshootClamping === second.overshootClamping &&
        (first.allowTail ?? null) === (second.allowTail ?? null) &&
        (first.durationRestThreshold ?? null) ===
          (second.durationRestThreshold ?? null)
      );
    default:
      throw new Error(
        `Unsupported easing: ${JSON.stringify(first satisfies never)}`,
      );
  }
};

type EasingFieldsProps<Easing extends CanvasKeyframeEasing> = {
  readonly easing: Easing;
  /** Shows the easing on the canvas while a value is being dragged. */
  readonly onPreview: (easing: Easing) => void;
  readonly onCommit: (easing: Easing) => void;
  readonly onCancel: () => void;
};

const BezierFields: React.FC<EasingFieldsProps<BezierEasing>> = ({
  easing,
  onPreview,
  onCommit,
  onCancel,
}) => {
  // Control points must stay inside the time axis; the value axis may
  // overshoot, which is how "back" easings are written.
  const coordinate = (key: keyof Omit<BezierEasing, "type">, label: string) => (
    <NumberField
      ariaLabel={label}
      unit={label}
      value={easing[key]}
      min={key.startsWith("x") ? 0 : -2}
      max={key.startsWith("x") ? 1 : 3}
      step={0.01}
      onLiveChange={(value) => onPreview({ ...easing, [key]: value })}
      onCommit={(value) => onCommit({ ...easing, [key]: value ?? easing[key] })}
      onCancel={onCancel}
    />
  );

  return (
    <>
      <FieldRow label="Handle 1">
        {coordinate("x1", "X1")}
        {coordinate("y1", "Y1")}
      </FieldRow>
      <FieldRow label="Handle 2">
        {coordinate("x2", "X2")}
        {coordinate("y2", "Y2")}
      </FieldRow>
    </>
  );
};

const springLimits = {
  damping: { min: 1, max: 200, step: 1 },
  mass: { min: 0.1, max: 20, step: 0.1 },
  stiffness: { min: 1, max: 1000, step: 1 },
} as const;

const SpringFields: React.FC<EasingFieldsProps<SpringEasing>> = ({
  easing,
  onPreview,
  onCommit,
  onCancel,
}) => {
  const parameter = (key: keyof typeof springLimits, label: string) => (
    <FieldRow label={label}>
      <NumberField
        ariaLabel={label}
        value={easing[key]}
        {...springLimits[key]}
        onLiveChange={(value) => onPreview({ ...easing, [key]: value })}
        onCommit={(value) =>
          onCommit({ ...easing, [key]: value ?? easing[key] })
        }
        onCancel={onCancel}
      />
    </FieldRow>
  );

  return (
    <>
      {parameter("damping", "Damping")}
      {parameter("mass", "Mass")}
      {parameter("stiffness", "Stiffness")}
      <FieldRow label="Clamp overshoot">
        <BooleanField
          ariaLabel="Clamp overshoot"
          value={easing.overshootClamping}
          onCommit={(overshootClamping) =>
            onCommit({ ...easing, overshootClamping })
          }
        />
      </FieldRow>
    </>
  );
};

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

/** The `interpolate()` options of the prop a segment belongs to. */
const InterpolationSettings: React.FC<{ readonly prop: KeyframedProp }> = ({
  prop,
}) => {
  const { actions } = useEditor();
  const settings = getCanvasKeyframeSettings(prop.propStatus);
  const { clamping } = settings;
  const apply = (next: CanvasKeyframeSettings) => {
    void actions.applyKeyframeChanges([
      getCanvasKeyframeSettingsChange({
        nodePathInfo: prop.layer.nodePathInfo,
        schema: prop.schema,
        key: prop.key,
        propStatus: prop.propStatus,
        settings: next,
      }),
    ]);
  };
  const extrapolateOptions = settings.extrapolateTypes.map((type) => ({
    value: type,
    label: capitalize(type),
  }));

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
        Interpolation
      </h3>
      {clamping ? (
        <>
          <FieldRow label={<span title="extrapolateLeft">Before start</span>}>
            <SelectField
              ariaLabel="Extrapolate left"
              value={clamping.left}
              options={extrapolateOptions}
              onCommit={(left) =>
                apply({
                  ...settings,
                  clamping: { ...clamping, left: left as ExtrapolateType },
                })
              }
            />
          </FieldRow>
          <FieldRow label={<span title="extrapolateRight">After end</span>}>
            <SelectField
              ariaLabel="Extrapolate right"
              value={clamping.right}
              options={extrapolateOptions}
              onCommit={(right) =>
                apply({
                  ...settings,
                  clamping: { ...clamping, right: right as ExtrapolateType },
                })
              }
            />
          </FieldRow>
        </>
      ) : null}
      {settings.output ? (
        <FieldRow label="Output">
          <SelectField
            ariaLabel="Output"
            value={settings.output}
            options={[
              { value: "linear", label: "Linear" },
              { value: "perceptual-scale", label: "Perceptual scale" },
            ]}
            onCommit={(output) =>
              apply({ ...settings, output: output as InterpolateOutputOption })
            }
          />
        </FieldRow>
      ) : null}
      <FieldRow label="Posterize">
        <NumberField
          ariaLabel="Posterize"
          value={settings.posterize}
          placeholder="Every frame"
          unit="frames"
          min={0}
          step={1}
          integer
          allowEmpty
          onCommit={(posterize) =>
            apply({
              ...settings,
              posterize:
                posterize === null || posterize <= 0 ? null : posterize,
            })
          }
          onCancel={null}
        />
      </FieldRow>
    </section>
  );
};

/**
 * Edits the easing of the selected segments between keyframes. Presets and
 * parameter changes are previewed on the canvas through overrides and then
 * written to the `interpolate()` call.
 */
export const EasingInspector: React.FC<{
  readonly items: readonly EasingSelectionItem[];
}> = ({ items }) => {
  const { keyframedProps, actions } = useEditor();
  // While a parameter is being dragged, the graph follows the draft.
  const [draft, setDraft] = useState<CanvasKeyframeEasing | null>(null);
  const targets = items.flatMap((item) => {
    const prop = findKeyframedProp(keyframedProps, item);
    const segment = prop?.easingSegments.find(
      (candidate) => candidate.segmentIndex === item.segmentIndex,
    );
    return prop && segment ? [{ prop, segment }] : [];
  });
  const first = targets[0];
  if (!first) {
    return (
      <p className="text-muted-foreground p-3 text-[11px] leading-relaxed">
        The selected easing is no longer in the source.
      </p>
    );
  }

  const { prop, segment } = first;
  const easing = draft ?? segment.easing;
  const changesFor = (next: CanvasKeyframeEasing) =>
    getEasingChanges({ items, keyframedProps, easing: next });
  const preview = (next: CanvasKeyframeEasing) => {
    setDraft(next);
    actions.previewKeyframeChanges(changesFor(next));
  };
  const commit = (next: CanvasKeyframeEasing) => {
    setDraft(null);
    void actions.applyEasing(items, next);
  };
  const cancel = () => {
    setDraft(null);
    actions.cancelKeyframePreviews(changesFor(easing));
  };

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 self-start text-[11px]"
          onClick={() =>
            actions.selectLayer(prop.layer, {
              shiftKey: false,
              toggleKey: false,
            })
          }
        >
          <ChevronLeftIcon className="size-3" />
          {getLayerLabel(prop.layer)}
        </button>
        <div className="text-sm font-medium">
          {getFieldLabel(prop.key, prop.field)} easing
        </div>
        <div className="text-muted-foreground-dim text-[10px]">
          Frames {segment.fromFrame} – {segment.toFrame}
          {targets.length > 1 ? ` · ${targets.length} segments selected` : ""}
        </div>
      </div>
      <div className="border-border text-primary rounded-md border p-2">
        <EasingCurve
          easing={easing}
          width={240}
          height={140}
          guides
          className="h-auto w-full"
        />
      </div>
      <section className="flex flex-col gap-2">
        <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
          Presets
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {canvasKeyframeEasingPresets.map((preset) => {
            const selected = areEasingsEqual(easing, preset.easing);
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                aria-label={`Apply ${preset.label} easing`}
                aria-pressed={selected}
                className={cn(
                  "flex h-9 items-center justify-center rounded-md border",
                  selected
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                onClick={() => commit(preset.easing)}
              >
                <EasingCurve easing={preset.easing} width={32} height={22} />
              </button>
            );
          })}
        </div>
      </section>
      {easing.type === "bezier" ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
            Bezier
          </h3>
          <BezierFields
            easing={easing}
            onPreview={preview}
            onCommit={commit}
            onCancel={cancel}
          />
        </section>
      ) : easing.type === "spring" ? (
        <section className="flex flex-col gap-2">
          <h3 className="text-muted-foreground-dim text-[10px] font-semibold tracking-wide uppercase">
            Spring
          </h3>
          <SpringFields
            easing={easing}
            onPreview={preview}
            onCommit={commit}
            onCancel={cancel}
          />
        </section>
      ) : null}
      <InterpolationSettings prop={prop} />
    </div>
  );
};
