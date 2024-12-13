import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { Caption } from "@remotion/captions";

export const audiogramSchema = z.object({
  audioOffsetInSeconds: z.number().min(0),
  subtitlesFileName: z
    .string()
    .refine((s) => s.endsWith(".srt") || s.endsWith(".json"), {
      message: "Subtitles file must be a .srt or .json file",
    }),
  audioFileName: z
    .string()
    .refine((s) => s.endsWith(".mp3") || s.endsWith(".wav"), {
      message: "Audio file must be a .mp3 or .wav file",
    }),
  coverImgFileName: z
    .string()
    .refine(
      (s) =>
        s.endsWith(".jpg") ||
        s.endsWith(".jpeg") ||
        s.endsWith(".png") ||
        s.endsWith(".bmp"),
      {
        message: "Image file must be a .jpg / .jpeg / .png / .bmp file",
      },
    ),
  titleText: z.string(),
  titleColor: zColor(),
  waveColor: zColor(),
  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
  mirrorWave: z.boolean(),
  waveLinesToDisplay: z.number().int().min(0),
  waveFreqRangeStartIndex: z.number().int().min(0),
  waveNumberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});

export type AudiogramCompositionSchemaType = z.infer<typeof audiogramSchema> & {
  captions: Caption[] | null;
};
