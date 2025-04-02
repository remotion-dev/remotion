import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { Caption } from "@remotion/captions";

const baseVisualizerSchema = z.object({
  color: zColor(),
  numberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});

const spectrumVisualizerSchema = baseVisualizerSchema.extend({
  type: z.literal("spectrum"),
  linesToDisplay: z.number().int().min(0).default(65),
  freqRangeStartIndex: z.number().int().min(0).default(0),
  mirrorWave: z.boolean(),
});

const oscilloscopeVisualizerSchema = baseVisualizerSchema.extend({
  type: z.literal("oscilloscope"),
  windowInSeconds: z.number().min(0.1).default(0.1),
  posterization: z.number().int().min(0.1).default(3),
  amplitude: z.number().int().min(0.1).default(4),
  padding: z.number().int().min(0).default(50),
});

const visualizerSchema = z.discriminatedUnion("type", [
  spectrumVisualizerSchema,
  oscilloscopeVisualizerSchema,
]);

export const audiogramSchema = z.object({
  // visualizer settings
  visualizer: visualizerSchema,
  // podcast data
  coverImageUrl: z.string(),
  titleText: z.string(),
  titleColor: zColor(),
  // captions settings
  captionsFileName: z
    .string()
    .refine((s) => s.endsWith(".srt") || s.endsWith(".json"), {
      message: "Subtitles file must be a .srt or .json file",
    }),
  captionsTextColor: zColor(),
  onlyDisplayCurrentSentence: z.boolean(),
  // audio settings
  audioFileUrl: z.string(),
  audioOffsetInSeconds: z.number().min(0),
});

export type AudiogramCompositionSchemaType = z.infer<typeof audiogramSchema> & {
  captions: Caption[] | null;
};
