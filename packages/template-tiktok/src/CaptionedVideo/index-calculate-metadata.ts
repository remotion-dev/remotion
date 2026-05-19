import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { z } from "zod";

const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;

