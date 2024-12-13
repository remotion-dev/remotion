import { parseSrt } from "@remotion/captions";

export const getSubtitles = async (file: string) => {
  const res = await fetch(file);
  const text = await res.text();

  const { captions } = parseSrt({
    input: text,
  });

  return captions;
};
