import { staticFile } from "remotion";
import { BackgroundElement, Timeline } from "./types";
import { FPS, INTRO_DURATION } from "./constants";

export const loadTimelineFromFile = async (filename: string) => {
  const res = await fetch(staticFile(filename));
  const json = await res.json();
  const timeline = json as Timeline;
  timeline.elements.sort((a, b) => a.startMs - b.startMs);

  const lengthMs =
    timeline.elements.length > 0
      ? timeline.elements[timeline.elements.length - 1].endMs / 1000
      : 0;
  const lengthFrames = Math.floor(lengthMs * FPS);

  return { timeline, lengthFrames };
};

export const calculateFrameTiming = (
  startMs: number,
  endMs: number,
  options: { includeIntro?: boolean; addIntroOffset?: boolean } = {},
) => {
  const { includeIntro = false, addIntroOffset = false } = options;

  const startFrame =
    (startMs * FPS) / 1000 + (addIntroOffset ? INTRO_DURATION : 0);
  const duration =
    ((endMs - startMs) * FPS) / 1000 + (includeIntro ? INTRO_DURATION : 0);

  return { startFrame, duration };
};

export const calculateBlur = ({
  item,
  localMs,
}: {
  item: BackgroundElement;
  localMs: number;
}) => {
  const maxBlur = 1;
  const fadeMs = 1000;

  const startMs = item.startMs;
  const endMs = item.endMs;

  const { enterTransition } = item;
  const { exitTransition } = item;

  if (enterTransition === "blur" && localMs < fadeMs) {
    return (1 - localMs / fadeMs) * maxBlur;
  }

  if (exitTransition === "blur" && localMs > endMs - startMs - fadeMs) {
    return (1 - (endMs - startMs - localMs) / fadeMs) * maxBlur;
  }

  return 0;
};

export const getTimelinePath = (proj: string) =>
  `content/${proj}/timeline.json`;

export const getImagePath = (proj: string, uid: string) =>
  `content/${proj}/images/${uid}.png`;

export const getAudioPath = (proj: string, uid: string) =>
  `content/${proj}/audio/${uid}.mp3`;
