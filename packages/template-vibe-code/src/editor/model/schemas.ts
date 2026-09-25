import {
  Interactive,
  type InteractivitySchema,
  type InteractivitySchemaField,
} from "remotion";
import type { Layer } from "./layers";

// The inspector is driven by the interactivity schema of the mounted element,
// which the Canvas reports through `track.sequence.controls`. This covers
// components made interactive with `Interactive.withSchema()` as well. The
// schemas composed below from the public `Interactive.*Schema` fragments are
// the fallback for elements that are not mounted, e.g. while hidden.

const textContentSchema: InteractivitySchema = {
  children: {
    type: "text-content",
    default: "",
    description: "Text",
  },
};

const assetSchema = (
  assetType: "image" | "video" | "audio",
): InteractivitySchema => ({
  src: {
    type: "asset",
    assetType,
    default: undefined,
    description: "Source",
  },
});

const volumeSchema: InteractivitySchema = {
  volume: {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    description: "Volume",
    hiddenFromList: false,
  },
  muted: {
    type: "boolean",
    default: false,
    description: "Muted",
  },
};

const htmlElementSchema: InteractivitySchema = {
  ...Interactive.baseSchema,
  ...Interactive.premountSchema,
  ...Interactive.transformSchema,
  ...Interactive.cropSchema,
  ...Interactive.backgroundSchema,
  ...Interactive.borderSchema,
  ...Interactive.borderRadiusSchema,
  ...Interactive.textSchema,
  ...textContentSchema,
};

const svgElementSchema: InteractivitySchema = {
  ...Interactive.baseSchema,
  ...Interactive.premountSchema,
  ...Interactive.transformSchema,
  ...Interactive.svgPaintSchema,
  ...Interactive.svgStrokeSchema,
};

const absoluteFillSchema: InteractivitySchema = {
  ...Interactive.baseSchema,
  ...Interactive.premountSchema,
  ...Interactive.transformSchema,
  ...Interactive.backgroundSchema,
  ...Interactive.borderSchema,
  ...Interactive.borderRadiusSchema,
  ...Interactive.textSchema,
};

const mediaVisualSchema: InteractivitySchema = {
  ...assetSchema("video"),
  ...Interactive.baseSchema,
  ...Interactive.premountSchema,
  ...volumeSchema,
  ...Interactive.transformSchema,
  ...Interactive.cropSchema,
  ...Interactive.borderRadiusSchema,
};

const schemasByTag: Record<string, InteractivitySchema> = {
  AbsoluteFill: absoluteFillSchema,
  Sequence: Interactive.sequenceSchema,
  "Series.Sequence": {
    durationInFrames: Interactive.baseSchema.durationInFrames,
    offset: {
      type: "number",
      default: 0,
      step: 1,
      description: "Offset",
      hiddenFromList: false,
    },
    name: Interactive.baseSchema.name,
    ...Interactive.premountSchema,
  },
  Loop: {
    durationInFrames: Interactive.baseSchema.durationInFrames,
    times: {
      type: "number",
      default: null,
      min: 1,
      step: 1,
      integer: true,
      description: "Times",
      hiddenFromList: false,
    },
    name: Interactive.baseSchema.name,
  },
  Freeze: {
    frame: {
      type: "number",
      default: 0,
      step: 1,
      integer: true,
      description: "Frame",
      hiddenFromList: false,
    },
    active: {
      type: "boolean",
      default: true,
      description: "Active",
    },
  },
  Img: {
    ...assetSchema("image"),
    ...Interactive.baseSchema,
    ...Interactive.premountSchema,
    ...Interactive.transformSchema,
    ...Interactive.cropSchema,
    ...Interactive.borderSchema,
    ...Interactive.borderRadiusSchema,
  },
  Solid: {
    ...Interactive.baseSchema,
    ...Interactive.premountSchema,
    color: {
      type: "color",
      default: "transparent",
      description: "Color",
    },
    width: {
      type: "number",
      min: 1,
      step: 1,
      default: undefined,
      description: "Width",
      hiddenFromList: false,
    },
    height: {
      type: "number",
      min: 1,
      step: 1,
      default: undefined,
      description: "Height",
      hiddenFromList: false,
    },
    ...Interactive.transformSchema,
    ...Interactive.borderRadiusSchema,
    ...Interactive.cropSchema,
  },
  Video: mediaVisualSchema,
  OffthreadVideo: mediaVisualSchema,
  Html5Video: mediaVisualSchema,
  Audio: {
    ...assetSchema("audio"),
    ...Interactive.baseSchema,
    ...volumeSchema,
  },
  Html5Audio: {
    ...assetSchema("audio"),
    ...Interactive.baseSchema,
    ...volumeSchema,
  },
};

const svgTags = new Set([
  "Circle",
  "Ellipse",
  "G",
  "Line",
  "Path",
  "Rect",
  "Svg",
  "Text",
]);

export const getSchemaForTag = (
  tagName: string,
): InteractivitySchema | null => {
  if (schemasByTag[tagName]) {
    return schemasByTag[tagName];
  }

  if (tagName.startsWith("Interactive.")) {
    return svgTags.has(tagName.slice("Interactive.".length))
      ? svgElementSchema
      : htmlElementSchema;
  }

  return null;
};

/** The editable props of a layer, as reported by the mounted element. */
export const getLayerSchema = (layer: Layer): InteractivitySchema | null => {
  return (
    layer.track.sequence.controls?.schema ??
    (layer.source ? getSchemaForTag(layer.source.tagName) : null)
  );
};

export type FieldGroup =
  | "timing"
  | "content"
  | "transform"
  | "appearance"
  | "text"
  | "crop"
  | "other";

export const fieldGroupLabels: Record<FieldGroup, string> = {
  content: "Content",
  timing: "Timing",
  transform: "Transform",
  appearance: "Appearance",
  text: "Typography",
  crop: "Crop",
  other: "Other",
};

export const fieldGroupOrder: FieldGroup[] = [
  "content",
  "timing",
  "transform",
  "appearance",
  "text",
  "crop",
  "other",
];

const timingKeys = new Set([
  "from",
  "durationInFrames",
  "trimBefore",
  "trimAfter",
  "offset",
  "playbackRate",
  "loop",
  "freeze",
  "hidden",
  "premountFor",
  "postmountFor",
  "times",
  "frame",
  "active",
  "layout",
]);

const contentKeys = new Set(["children", "src", "volume", "muted"]);
const transformKeys = new Set([
  "style.translate",
  "style.scale",
  "style.rotate",
  "style.opacity",
  "style.transformOrigin",
]);
const textKeys = new Set([
  "style.color",
  "style.fontFamily",
  "style.fontSize",
  "style.lineHeight",
  "style.fontWeight",
  "style.fontStyle",
  "style.textAlign",
  "style.letterSpacing",
]);

export const getFieldGroup = (key: string): FieldGroup => {
  if (contentKeys.has(key)) return "content";
  if (timingKeys.has(key)) return "timing";
  if (transformKeys.has(key)) return "transform";
  if (textKeys.has(key)) return "text";
  if (key.startsWith("crop")) return "crop";
  if (
    key.startsWith("style.background") ||
    key.startsWith("style.border") ||
    key === "color" ||
    key === "width" ||
    key === "height" ||
    key === "fill" ||
    key === "stroke" ||
    key === "strokeWidth"
  ) {
    return "appearance";
  }

  return "other";
};

const fieldLabels: Record<string, string> = {
  from: "From",
  durationInFrames: "Duration",
  trimBefore: "Trim before",
  trimAfter: "Trim after",
  loop: "Loop",
  freeze: "Freeze frame",
  hidden: "Hidden",
  playbackRate: "Speed",
  premountFor: "Premount",
  postmountFor: "Postmount",
  offset: "Offset",
  layout: "Layout",
  children: "Text",
  "style.translate": "Position",
  "style.scale": "Scale",
  "style.rotate": "Rotation",
  "style.opacity": "Opacity",
  "style.transformOrigin": "Origin",
  "style.backgroundColor": "Background",
  "style.borderRadius": "Radius",
  "style.borderWidth": "Border width",
  "style.borderStyle": "Border style",
  "style.borderColor": "Border color",
  "style.color": "Color",
  "style.fontFamily": "Font",
  "style.fontSize": "Size",
  "style.fontWeight": "Weight",
  "style.fontStyle": "Style",
  "style.lineHeight": "Line height",
  "style.textAlign": "Align",
  "style.letterSpacing": "Tracking",
};

export const getFieldLabel = (
  key: string,
  field: InteractivitySchemaField,
): string => {
  if (fieldLabels[key]) {
    return fieldLabels[key];
  }

  if (field.type !== "hidden" && field.description) {
    return field.description;
  }

  const leaf = key.split(".").at(-1) ?? key;
  const spaced = leaf.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Fields the inspector can display, in a stable order. */
export const getVisibleFields = (
  schema: InteractivitySchema,
): {
  key: string;
  field: Exclude<InteractivitySchemaField, { type: "hidden" }>;
}[] => {
  const supported = new Set([
    "number",
    "boolean",
    "rotation-css",
    "rotation-degrees",
    "translate",
    "transform-origin",
    "scale",
    "color",
    "text-content",
    "font-family",
    "font-weight",
    "asset",
    "enum",
  ]);
  return Object.entries(schema).flatMap(([key, field]) => {
    if (field.type === "hidden" || !supported.has(field.type)) {
      return [];
    }

    return [
      {
        key,
        field: field as Exclude<InteractivitySchemaField, { type: "hidden" }>,
      },
    ];
  });
};

export const hasTimingProps = (schema: InteractivitySchema | null) =>
  schema !== null && "from" in schema && "durationInFrames" in schema;
