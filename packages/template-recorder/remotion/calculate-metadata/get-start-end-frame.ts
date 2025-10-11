import { Caption } from "@remotion/captions";
import { FPS } from "../../config/fps";
import { SelectableVideoScene } from "../../config/scenes";
import { postprocessCaptions } from "../captions/processing/postprocess-subs";

const START_FRAME_PADDING = Math.ceil(FPS / 4);
const END_FRAME_PADDING = FPS / 2;

const deriveEndFrameFromSubs = (captions: Caption[] | null) => {
  if (!captions) {
    return null;
  }

  const lastCaption = captions[captions.length - 1];
  if (!lastCaption || !lastCaption.timestampMs) {
    return null;
  }

  const lastFrame = Math.floor((lastCaption.timestampMs / 1000) * FPS);
  return lastFrame;
};

const deriveStartFrameFromSubsJSON = (captions: Caption[] | null): number => {
  if (!captions) {
    return 0;
  }
  if (captions.length === 0) {
    return 0;
  }

  // taking the first real word and take its start timestamp in ms.
  const startFromInHundrethsOfSec = (captions[0] as Caption).timestampMs;
  if (startFromInHundrethsOfSec === null) {
    return 0;
  }

  const startFromInFrames =
    Math.floor((startFromInHundrethsOfSec / 1000) * FPS) - START_FRAME_PADDING;
  return startFromInFrames > 0 ? startFromInFrames : 0;
};

const getClampedStartFrame = ({
  startOffset,
  startFrameFromSubs,
  derivedEndFrame,
}: {
  startOffset: number;
  startFrameFromSubs: number;
  derivedEndFrame: number;
}): number => {
  const combinedStartFrame = startFrameFromSubs + startOffset;

  if (combinedStartFrame > derivedEndFrame) {
    return derivedEndFrame;
  }

  if (combinedStartFrame < 0) {
    return 0;
  }

  return combinedStartFrame;
};

const getClampedEndFrame = ({
  durationInSeconds,
  endFrameFromCaptions,
  endOffset,
}: {
  endOffset: number;
  durationInSeconds: number;
  endFrameFromCaptions: number | null;
}): number => {
  const videoDurationInFrames = Math.floor(durationInSeconds * FPS);
  if (!endFrameFromCaptions) {
    return Math.min(videoDurationInFrames, videoDurationInFrames + endOffset);
  }

  const paddedEndFrame = endFrameFromCaptions + END_FRAME_PADDING + endOffset;
  if (paddedEndFrame > videoDurationInFrames) {
    return videoDurationInFrames;
  }

  return paddedEndFrame;
};

export const getStartEndFrame = async ({
  scene,
  recordingDurationInSeconds,
  captions,
}: {
  scene: SelectableVideoScene;
  recordingDurationInSeconds: number;
  captions: Caption[] | null;
}) => {
  // We calculate the subtitles only for
  // the purpose of calculating the durastion
  // and will not use this value further
  const subsForTimestamps = captions ? postprocessCaptions(captions) : null;

  const endFrameFromCaptions = deriveEndFrameFromSubs(subsForTimestamps);
  const derivedEndFrame = getClampedEndFrame({
    durationInSeconds: recordingDurationInSeconds,
    endFrameFromCaptions,
    endOffset: scene.endOffset,
  });

  const startFrameFromSubs = deriveStartFrameFromSubsJSON(subsForTimestamps);
  const actualStartFrame = getClampedStartFrame({
    startOffset: scene.startOffset,
    startFrameFromSubs,
    derivedEndFrame,
  });

  return { actualStartFrame, derivedEndFrame };
};
