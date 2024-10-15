import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export const env = z
  .object({
    AZURE_TTS_KEY: z.string(),
    AZURE_TTS_REGION: z.string(),
    AWS_S3_BUCKET_NAME: z.string(),
    AWS_S3_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
  })
  .parse(process.env);

const voices = ["ptBRWoman", "ptBRMan", "enUSWoman1", "enUSWoman2"] as const;

export type Voice = (typeof voices)[number];

export const compSchema = z.object({
  text: z.string(),
  titleColor: zColor(),
  voice: z.enum(voices),
  displaySpeed: z.number(),
});
