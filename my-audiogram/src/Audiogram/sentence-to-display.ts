import { Caption } from "@remotion/captions";
import { msToFrame } from "../helpers/ms-to-frame";

export const getSentenceToDisplay = ({
  windowedFrameSubs,
  onlyDisplayCurrentSentence,
  frame,
}: {
  windowedFrameSubs: Caption[];
  onlyDisplayCurrentSentence: boolean;
  frame: number;
}) => {
  // If we don't want to only display the current sentence, return all the words
  if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

  const indexOfCurrentSentence =
    windowedFrameSubs.findLastIndex((w, i) => {
      const nextWord = windowedFrameSubs[i + 1];

      return (
        nextWord &&
        (w.text.endsWith("?") ||
          w.text.endsWith(".") ||
          w.text.endsWith("!")) &&
        msToFrame(nextWord.startMs) < frame
      );
    }) + 1;

  return windowedFrameSubs.slice(indexOfCurrentSentence);
};
