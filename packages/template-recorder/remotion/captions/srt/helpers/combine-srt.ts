import { UnserializedSrt } from "./serialize-srt";

export type SrtsToCombine = {
  offsetInMs: number;
  srts: UnserializedSrt[];
};

export const combineSrt = (srt: SrtsToCombine[]): UnserializedSrt[] => {
  return srt
    .map((line) => {
      return line.srts.map((s): UnserializedSrt => {
        return {
          text: s.text,
          firstTimestampMs: s.firstTimestampMs + line.offsetInMs,
          lastTimestampMs: s.lastTimestampMs + line.offsetInMs,
          captions: s.captions,
        };
      });
    })
    .flat(1);
};
