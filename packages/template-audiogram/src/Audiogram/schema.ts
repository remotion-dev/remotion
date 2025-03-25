import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { Caption } from "@remotion/captions";

export const audiogramSchema = z.object({
  // visualizer settings
  visualizerType: z.enum(["oscilloscope", "spectrum"]),
  visualizerLinesToDisplay: z.number().int().min(0),
  visualizerFreqRangeStartIndex: z.number().int().min(0),
  visualizerNumberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
  visualizerMirror: z.boolean(),
  visualizerColor: zColor(),
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
  captionsLinePerPage: z.number().int().min(0),
  captionsLineHeight: z.number().int().min(0),
  captionsZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
  // audio settings
  audioFileUrl: z.string(),
  audioOffsetInSeconds: z.number().min(0),
});

export type AudiogramCompositionSchemaType = z.infer<typeof audiogramSchema> & {
  captions: Caption[] | null;
};
