import { Internals, type CanUpdateSequencePropStatus } from "remotion";
import {
  getCanvasKeyframeEasingChange,
  getCanvasKeyframeEasingSegments,
  getCanvasKeyframes,
  getCanvasSelectionItemKey,
  type CanvasKeyframe,
  type CanvasKeyframeChange,
  type CanvasKeyframeEasing,
  type CanvasKeyframeEasingSegment,
  type CanvasSelectionItem,
  type SequenceNodePathInfo,
} from "@remotion/sdk";
import { getNodeProps, type CodemodProject } from "@remotion/codemods";
import type {
  CanUpdateSequencePropStatusKeyframed,
  InteractivitySchema,
  InteractivitySchemaField,
  VideoConfigValues,
} from "remotion";
import { getNodeReference, type Layer } from "./layers";
import { getLayerSchema, getVisibleFields } from "./schemas";

/** A prop of a layer that is animated with `interpolate()` in the source. */
export type KeyframedProp = {
  layer: Layer;
  key: string;
  field: InteractivitySchemaField;
  schema: InteractivitySchema;
  propStatus: CanUpdateSequencePropStatusKeyframed;
  /** The keyframes placed on the composition timeline. */
  keyframes: CanvasKeyframe[];
  /** The spans between the keyframes whose easing can be edited. */
  easingSegments: CanvasKeyframeEasingSegment[];
  /** Identifies the prop in the Canvas selection, e.g. for its keyframes. */
  nodePathInfo: SequenceNodePathInfo;
};

export type KeyframeSelectionItem = Extract<
  CanvasSelectionItem,
  { type: "keyframe" }
>;

export type EasingSelectionItem = Extract<
  CanvasSelectionItem,
  { type: "easing" }
>;

/**
 * The selection identity of a prop's keyframe row. The Canvas keeps keyframe
 * selection items under the sequence with the schema key as auxiliary path,
 * like the Remotion Studio does.
 */
export const getKeyframedPropNodePathInfo = (
  layer: Layer,
  key: string,
): SequenceNodePathInfo => ({
  ...layer.nodePathInfo,
  auxiliaryKeys: ["controls", key],
});

export const getKeyframeSelectionItem = (
  prop: Pick<KeyframedProp, "nodePathInfo">,
  frame: number,
): KeyframeSelectionItem => ({
  type: "keyframe",
  nodePathInfo: prop.nodePathInfo,
  frame,
});

export const getEasingSelectionItem = (
  prop: Pick<KeyframedProp, "nodePathInfo">,
  segment: CanvasKeyframeEasingSegment,
): EasingSelectionItem => ({
  type: "easing",
  nodePathInfo: prop.nodePathInfo,
  fromFrame: segment.fromFrame,
  toFrame: segment.toFrame,
  segmentIndex: segment.segmentIndex,
});

const getKeyframedPropKey = (prop: Pick<KeyframedProp, "nodePathInfo">) =>
  getCanvasSelectionItemKey({
    type: "sequence-prop",
    nodePathInfo: prop.nodePathInfo,
    key: prop.nodePathInfo.auxiliaryKeys.slice(1).join("."),
  });

/**
 * The animated props of every layer, read from the source. Layers without a
 * source node or with an unparsable file have no keyframed props.
 */
export const getKeyframedProps = ({
  layers,
  project,
  videoConfig,
}: {
  layers: readonly Layer[];
  project: CodemodProject;
  videoConfig: VideoConfigValues;
}): KeyframedProp[] => {
  return layers.flatMap((layer): KeyframedProp[] => {
    const node = getNodeReference(layer.selectionItem);
    const schema = getLayerSchema(layer);
    if (!node || !schema) {
      return [];
    }

    const fields = getVisibleFields(schema);
    let props: Record<string, CanUpdateSequencePropStatus>;
    try {
      props = Internals.evaluateSourcePropStatuses(getNodeProps({
        project,
        node,
        keys: fields.map(({ key }) => key),
      }).props, layer.track.sequence.controls?.videoConfigValues ?? videoConfig);
    } catch {
      return [];
    }

    return fields.flatMap(({ key, field }): KeyframedProp[] => {
      const propStatus = props[key];
      if (propStatus?.status !== "keyframed") {
        return [];
      }

      const nodePathInfo = getKeyframedPropNodePathInfo(layer, key);
      return [
        {
          layer,
          key,
          field,
          schema,
          propStatus,
          keyframes: getCanvasKeyframes({ track: layer.track, propStatus }),
          easingSegments: getCanvasKeyframeEasingSegments({
            track: layer.track,
            schema,
            key,
            propStatus,
          }),
          nodePathInfo,
        },
      ];
    });
  });
};

export const getSelectedKeyframes = (
  selectedItems: readonly CanvasSelectionItem[],
): KeyframeSelectionItem[] =>
  selectedItems.filter(
    (item): item is KeyframeSelectionItem => item.type === "keyframe",
  );

export const getSelectedEasings = (
  selectedItems: readonly CanvasSelectionItem[],
): EasingSelectionItem[] =>
  selectedItems.filter(
    (item): item is EasingSelectionItem => item.type === "easing",
  );

/** Finds the keyframed prop a selected keyframe or easing segment belongs to. */
export const findKeyframedProp = (
  props: readonly KeyframedProp[],
  item: Pick<KeyframedProp, "nodePathInfo">,
): KeyframedProp | null => {
  const key = getKeyframedPropKey(item);
  return props.find((prop) => getKeyframedPropKey(prop) === key) ?? null;
};

/** The changes that give the selected easing segments the same easing. */
export const getEasingChanges = ({
  items,
  keyframedProps,
  easing,
}: {
  items: readonly EasingSelectionItem[];
  keyframedProps: readonly KeyframedProp[];
  easing: CanvasKeyframeEasing;
}): CanvasKeyframeChange[] =>
  items.flatMap((item) => {
    const prop = findKeyframedProp(keyframedProps, item);
    const change =
      prop &&
      getCanvasKeyframeEasingChange({
        nodePathInfo: prop.layer.nodePathInfo,
        schema: prop.schema,
        key: prop.key,
        propStatus: prop.propStatus,
        segmentIndex: item.segmentIndex,
        easing,
      });
    return change ? [change] : [];
  });
