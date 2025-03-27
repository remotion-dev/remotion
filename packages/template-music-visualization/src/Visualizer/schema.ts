import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const baseVisualizerSchema = z.object({
  color: zColor(),
  numberOfSamples: z.enum(["32", "64", "128", "256", "512", "1024"]),
});

const spectrumVisualizerSchema = baseVisualizerSchema.extend({
  type: z.literal("spectrum"),
  linesToDisplay: z.number().int().min(0).default(55),
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

export const visualizerCompositionSchema = z.object({
  // visualizer settings
  visualizer: visualizerSchema,
  // song data
  textColor: zColor(),
  coverImageUrl: z.string(),
  songName: z.string(),
  artistName: z.string(),
  // audio settings
  audioFileUrl: z.string(),
  audioOffsetInSeconds: z.number().min(0),
});

export type AudiogramCompositionSchemaType = z.infer<
  typeof visualizerCompositionSchema
>;
