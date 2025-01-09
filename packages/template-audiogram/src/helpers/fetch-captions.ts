import { Caption, parseSrt } from "@remotion/captions";

export const getSubtitlesFromSrt = async (src: string) => {
  const res = await fetch(src);
  const text = await res.text();

  const { captions } = parseSrt({
    input: text,
  });

  return captions.map((c) => {
    return {
      ...c,
      text: ` ${c.text}`,
    };
  });
};

export const getSubtitlesFromJson = async (src: string) => {
  const res = await fetch(src);
  const captions = (await res.json()) as Caption[];

  return captions;
};

export const getSubtitles = (src: string) => {
  if (src.endsWith(".json")) {
    return getSubtitlesFromJson(src);
  }
  if (src.endsWith(".srt")) {
    return getSubtitlesFromSrt(src);
  }

  throw new Error("subtitles must be either a .srt or a .json");
};
