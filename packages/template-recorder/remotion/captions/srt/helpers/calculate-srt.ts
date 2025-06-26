import type { Caption } from "@remotion/captions";
import { FPS } from "../../../../config/fps";
import { joinBackticks } from "../../processing/join-backticks";
import { postprocessCaptions } from "../../processing/postprocess-subs";
import type { UnserializedSrt } from "./serialize-srt";

// The SRT standard recommends not more than 42 characters per line

const MAX_CHARS_PER_LINE = 42;

const segmentCaptions = (caption: Caption[]) => {
  const segments: Caption[][] = [];
  let currentSegment: Caption[] = [];

  for (let i = 0; i < caption.length; i++) {
    const w = caption[i] as Caption;
    const remainingCaptions = caption.slice(i + 1);
    const filledCharactersInLine = currentSegment
      .map((s) => s.text.length)
      .reduce((a, b) => a + b, 0);

    const preventOrphanCaption =
      remainingCaptions.length < 4 &&
      remainingCaptions.length > 1 &&
      filledCharactersInLine > MAX_CHARS_PER_LINE / 2;

    if (
      filledCharactersInLine + w.text.length > MAX_CHARS_PER_LINE ||
      preventOrphanCaption
    ) {
      segments.push(currentSegment);
      currentSegment = [];
    }
    currentSegment.push(w);
  }

  segments.push(currentSegment);
  return segments;
};

export const calculateSrt = ({
  startFrame,
  captions,
}: {
  captions: Caption[];
  startFrame: number;
}) => {
  const postprocessed = joinBackticks(postprocessCaptions(captions));
  const segments = segmentCaptions(postprocessed);

  const srtSegments: UnserializedSrt[] = [];

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) {
      throw new Error(`Segment with index ${i} is undefined`);
    }

    if (segment.length === 0) {
      continue;
    }

    const firstSegment = segment[0];
    const lastSegment = segment[segment.length - 1];

    if (!firstSegment) {
      throw new Error("lastSegment is undefined");
    }
    if (!lastSegment) {
      throw new Error("lastSegment is undefined");
    }

    const offset = -(startFrame / FPS) * 1000;

    const firstTimestampMs = Math.max(0, Math.round(firstSegment.startMs + offset));
    if (lastSegment.endMs === null) {
      throw new Error("Cannot serialize .srt file: lastTimestamp is null");
    }

    const lastTimestampMs = Math.max(0, lastSegment.endMs + offset);

    const unserialized: UnserializedSrt = {
      firstTimestampMs,
      lastTimestampMs,
      text: segment
        .map((s) => s.text.trim())
        .join(" ")
        .trim(),
      captions: segment,
    };
    srtSegments.push(unserialized);
  }

  return srtSegments;
};
