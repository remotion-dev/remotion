import { Caption } from "@remotion/captions";

export type CaptionPage = {
  captions: Caption[];
};

export type LayoutedCaptions = {
  segments: CaptionPage[];
};
