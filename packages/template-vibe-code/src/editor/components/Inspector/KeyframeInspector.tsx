"use client";

import {
  getCanvasKeyframeSourceFrame,
  getCanvasKeyframeValueChange,
  getCanvasSelectionItemKey,
  type CanvasKeyframeChange,
} from "@remotion/sdk";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  findKeyframedProp,
  type KeyframeSelectionItem,
} from "../../model/keyframes";
import { getLayerLabel } from "../../model/layers";
import { getFieldLabel } from "../../model/schemas";
import { formatNumber } from "../../model/values";
import { useEditor } from "../../state/editor-context";
import { PropFieldEditor } from "./LayerInspector";
import { FieldRow, TextField } from "./fields";

export const KeyframeInspector: React.FC<{
  readonly items: readonly KeyframeSelectionItem[];
  readonly easingCount: number;
}> = ({ items, easingCount }) => {
  const { keyframedProps, actions } = useEditor();
  const [editorRevision, setEditorRevision] = useState(0);
  const previewRef = useRef<CanvasKeyframeChange | null>(null);
  useEffect(
    () => () => {
      if (previewRef.current)
        actions.cancelKeyframePreviews([previewRef.current]);
    },
    [actions],
  );

  const cancel = () => {
    if (previewRef.current)
      actions.cancelKeyframePreviews([previewRef.current]);
    previewRef.current = null;
  };
  const commit = async (value: unknown) => {
    previewRef.current = null;
    const changed = await actions.commitKeyframeValue(items[0], value);
    if (!changed) setEditorRevision((revision) => revision + 1);
  };
  const item = items[0];
  const prop = findKeyframedProp(keyframedProps, item);
  const sourceFrame = prop
    ? getCanvasKeyframeSourceFrame({
        track: prop.layer.track,
        propStatus: prop.propStatus,
        frame: item.frame,
      })
    : null;
  const keyframe = prop?.propStatus.keyframes.find(
    (candidate) => candidate.frame === sourceFrame,
  );
  const single = items.length === 1 && easingCount === 0;
  const rawTransform =
    prop &&
    keyframe &&
    typeof keyframe.value === "string" &&
    ((prop.field.type === "scale" && /\s/.test(keyframe.value.trim())) ||
      (prop.field.type === "rotation-css" &&
        !/^[+-]?(?:\d+\.?\d*|\.\d+)deg$/.test(keyframe.value)) ||
      (prop.field.type === "translate" &&
        !/^[+-]?(?:\d+\.?\d*|\.\d+)px(?:\s+[+-]?(?:\d+\.?\d*|\.\d+)px)?$/.test(
          keyframe.value,
        )));

  return (
    <div className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">
          {single && prop
            ? `${getFieldLabel(prop.key, prop.field)} keyframe`
            : `${items.length} keyframes selected`}
        </div>
        {single && prop ? (
          <div className="text-muted-foreground text-[11px]">
            {getLayerLabel(prop.layer)} · Frame {formatNumber(item.frame, 4)}
          </div>
        ) : (
          <ul className="text-muted-foreground flex flex-col gap-1 text-[11px]">
            {items.map((selected) => {
              const target = findKeyframedProp(keyframedProps, selected);
              return (
                <li key={getCanvasSelectionItemKey(selected)}>
                  {target
                    ? `${getLayerLabel(target.layer)} · ${getFieldLabel(target.key, target.field)}`
                    : "Keyframe"}{" "}
                  · Frame {formatNumber(selected.frame, 4)}
                </li>
              );
            })}
          </ul>
        )}
        {easingCount > 0 ? (
          <p className="text-muted-foreground text-[11px]">
            {easingCount} easing {easingCount === 1 ? "segment" : "segments"}{" "}
            also selected
          </p>
        ) : null}
      </div>
      {single ? (
        prop && keyframe && prop.field.type !== "hidden" ? (
          rawTransform ? (
            <FieldRow label={getFieldLabel(prop.key, prop.field)}>
              <TextField
                key={editorRevision}
                ariaLabel={getFieldLabel(prop.key, prop.field)}
                value={String(keyframe.value)}
                onCommit={(value) => void commit(value)}
              />
            </FieldRow>
          ) : (
            <PropFieldEditor
              key={editorRevision}
              fieldKey={prop.key}
              field={prop.field}
              codeValue={keyframe.value}
              badge={null}
              keyframe={undefined}
              onCommit={(value) => void commit(value)}
              onPreview={(values) => {
                const change = getCanvasKeyframeValueChange({
                  nodePathInfo: prop.layer.nodePathInfo,
                  track: prop.layer.track,
                  schema: prop.schema,
                  key: prop.key,
                  propStatus: prop.propStatus,
                  frame: item.frame,
                  value: values[prop.key],
                });
                if (!change) {
                  cancel();
                  return;
                }
                previewRef.current = change;
                actions.previewKeyframeChanges([change]);
              }}
              onCancelPreview={cancel}
            />
          )
        ) : (
          <p className="text-muted-foreground text-[11px]">
            The selected keyframe is no longer in the source.
          </p>
        )
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {single ? (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => actions.seek(item.frame)}
          >
            Go to keyframe
          </Button>
        ) : null}
        <Button
          size="xs"
          variant="destructive"
          onClick={() => void actions.deleteSelectedKeyframes()}
        >
          Delete {items.length === 1 ? "keyframe" : "keyframes"}
        </Button>
        <Button size="xs" variant="ghost" onClick={actions.clearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  );
};
