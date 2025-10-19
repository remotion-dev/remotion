import { staticFile } from "remotion";
import { Timeline } from "./types";
import { FPS } from "./constants";

export const loadTimelineFromFile = async (filename: string) => {
  const res = await fetch(staticFile(filename));
  const json = await res.json();
  const timeline = json as Timeline;
  timeline.elements.sort((a, b) => a.startMs - b.startMs);

  const lengthMs = timeline.elements[timeline.elements.length - 1].endMs / 1000;
  const lengthFrames = Math.floor(lengthMs * FPS);

  return { timeline, lengthFrames };
};
