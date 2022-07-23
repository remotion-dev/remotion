import { isAudioCodec } from "../is-audio-codec";
import type { Codec } from "./codec";

let currentCrf: Crf;

export const setCrf = (newCrf: Crf) => {
  if (typeof newCrf !== "number" && newCrf !== undefined) {
    throw new TypeError("The CRF must be a number or undefined.");
  }

  currentCrf = newCrf;
};

export const getCrfOrUndefined = () => {
  return currentCrf;
};

export const getActualCrf = (codec: Codec) => {
  const crf = getCrfOrUndefined() ?? getDefaultCrfForCodec(codec);
  validateSelectedCrfAndCodecCombination(crf, codec);
  return crf;
};
