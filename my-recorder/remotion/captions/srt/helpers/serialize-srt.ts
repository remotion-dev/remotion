import { Caption } from "@remotion/captions";

export type UnserializedSrt = {
  firstTimestampMs: number;
  lastTimestampMs: number;
  text: string;
  // Not effectively used for SRT serializing, but allows for clicking on a caption to jump to it
  captions: Caption[];
};

const formatSingleSrtTimestamp = (timestamp: number) => {
  const hours = Math.floor(timestamp / 3600000);
  const minutes = Math.floor((timestamp % 3600000) / 60000);
  const seconds = Math.floor((timestamp % 60000) / 1000);
  const milliseconds = Math.floor(timestamp % 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds).padStart(3, "0")}`;
};

const formatSrtTimestamp = (startMs: number, endMs: number) => {
  return `${formatSingleSrtTimestamp(startMs)} --> ${formatSingleSrtTimestamp(endMs)}`;
};

export const serializeSrt = (srt: UnserializedSrt[]) => {
  let currentIndex = 0;

  return srt
    .map((s) => {
      currentIndex++;
      return [
        // Index
        currentIndex,
        formatSrtTimestamp(s.firstTimestampMs, s.lastTimestampMs),
        // Text
        s.text,
      ].join("\n");
    })
    .join("\n\n");
};
