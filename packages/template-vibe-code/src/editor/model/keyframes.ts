import {
  getCanvasKeyframes,
  getCanvasSelectionItemKey,
  type CanvasKeyframe,
  type CanvasSelectionItem,
  type SequenceNodePathInfo,
} from "@remotion/canvas";
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
  /** Identifies the prop in the Canvas selection, e.g. for its keyframes. */
  nodePathInfo: SequenceNodePathInfo;
};

export type KeyframeSelectionItem = Extract<
  CanvasSelectionItem,
  { type: "keyframe" }
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
    let props: ReturnType<typeof getNodeProps>["props"];
    try {
      props = getNodeProps({
        project,
        node,
        keys: fields.map(({ key }) => key),
        videoConfig,
      }).props;
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

/** Finds the keyframed prop a selected keyframe belongs to. */
export const findKeyframedProp = (
  props: readonly KeyframedProp[],
  item: KeyframeSelectionItem,
): KeyframedProp | null => {
  const key = getKeyframedPropKey({ nodePathInfo: item.nodePathInfo });
  return props.find((prop) => getKeyframedPropKey(prop) === key) ?? null;
};
