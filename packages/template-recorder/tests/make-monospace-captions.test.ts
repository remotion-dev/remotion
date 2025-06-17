// eslint-disable-next-line @typescript-eslint/triple-slash-reference

import { Caption } from "@remotion/captions";
import { expect, test } from "bun:test";
import { splitCaptionIntoMonospaceSegments } from "../remotion/captions/processing/split-caption-into-monospace-segments";

test("Should split up into monospace words", () => {
  const caption: Caption = {
    text: "This is a `monospace` word",
    startMs: 0,
    endMs: 0,
    confidence: null,
    timestampMs: 0,
  };

  expect(splitCaptionIntoMonospaceSegments(caption)).toEqual([
    {
      text: "This is a ",
      startMs: 0,
      confidence: null,
      endMs: 0,
      timestampMs: 0,
    },
    {
      text: "`monospace`",
      startMs: 0,
      endMs: 0,
      confidence: null,
      timestampMs: 0,
    },
    {
      text: " word",
      startMs: 0,
      endMs: 0,
      confidence: null,
      timestampMs: 0,
    },
  ]);
});
