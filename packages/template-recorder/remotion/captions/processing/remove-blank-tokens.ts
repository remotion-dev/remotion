import { Caption } from "@remotion/captions";

export const removeBlankTokens = (tokens: Caption[]): Caption[] => {
  return tokens
    .filter((t) => t.text.trim() !== "")
    .filter((t) => {
      return !t.text.match(/TT_(\d+)/);
    });
};
