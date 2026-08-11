import { Caption } from "@remotion/captions";
import { autocorrectWords } from "../../../config/autocorrect";
import { fixBackticks } from "./fix-backticks";
import { removeBlankTokens } from "./remove-blank-tokens";

const FILLER_WORDS = [
  "[PAUSE]",
  "[BLANK_AUDIO]",
  "[Silence]",
  "[silence]",
  "[INAUDIBLE]",
];

const removeWhisperBlankWords = (original: Caption[]): Caption[] => {
  let firstIdx = 0;
  let concatenatedCaption = "";
  let inBlank = false;

  const captions = [...original];
  captions.forEach((caption, index) => {
    const captionCopy = { ...caption };
    captionCopy.text = captionCopy.text.trim();
    if (captionCopy.text.includes("[")) {
      inBlank = true;
      firstIdx = index;
    }

    if (inBlank && FILLER_WORDS.find((w) => w.includes(captionCopy.text))) {
      concatenatedCaption += captionCopy.text;
    }

    if (inBlank && captionCopy.text.includes("]")) {
      concatenatedCaption += captionCopy.text;
      if (
        FILLER_WORDS.find((caption) => concatenatedCaption.includes(caption))
      ) {
        for (let i = firstIdx; i <= index; i++) {
          const currentCaption = captions[i];
          if (currentCaption?.text !== undefined) {
            captions[i] = {
              ...currentCaption,
              text: "",
            };
          }
        }
      }
    }
  });
  return captions;
};

export const postprocessCaptions = (subTypes: Caption[]): Caption[] => {
  const blankTokensRemoved = removeBlankTokens(subTypes);

  const removeBlankAudioAndPause = removeWhisperBlankWords(blankTokensRemoved);
  const removeBlankTokensAgain = removeBlankAudioAndPause.filter(
    (w) => w.text.trim() !== "",
  );

  const correctedCaptions = autocorrectWords(removeBlankTokensAgain);

  return fixBackticks(correctedCaptions);
};
