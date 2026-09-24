import { zColor } from "@remotion/zod-types";
import { z } from "zod";

const baseVisualizerSchema = z.object({
  bassOverlay: z.boolean().default(true),
  color: zColor().default("#0b84f3"),
});

const spectrumVisualizerSchema = baseVisualizerSchema.extend({
  type: z.literal("spectrum"),
  linesToDisplay: z.number().int().min(0).default(65),
  mirrorWave: z.boolean(),
  numberOfSamples: z
    .enum(["32", "64", "128", "256", "512", "1024"])
    .default("512"),
});

const waveformVisualizerSchema = baseVisualizerSchema.extend({
  type: z.literal("oscilloscope"),
  windowInSeconds: z.number().min(0.1).default(1),
  amplitude: z.number().min(0.1).default(1.3),
});

const visualizerSchema = z.discriminatedUnion("type", [
  spectrumVisualizerSchema,
  waveformVisualizerSchema,
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
