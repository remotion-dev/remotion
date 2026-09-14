// eslint-disable-next-line @typescript-eslint/triple-slash-reference

import { Caption } from "@remotion/captions";
import { expect, test } from "bun:test";
import { fixBackticks } from "../remotion/captions/processing/fix-backticks";

const example: Caption[] = [
  {
    text: " `bun`",
    endMs: 5.94,
    startMs: 0,
    confidence: null,
    timestampMs: 0,
  },
  {
    text: " `run`",
    endMs: 6.54,
    startMs: 0,
    confidence: null,
    timestampMs: 0,
  },
  {
    text: " `dev`",
    endMs: 6.96,
    startMs: 0,
    confidence: null,
    timestampMs: 0,
  },
  {
    text: ". It",
    endMs: 8.36,
    startMs: 0,
    confidence: null,
    timestampMs: 0,
  },
  {
    text: " looks",
    endMs: 8.62,
    startMs: 0,
    confidence: null,
    timestampMs: 0,
  },
];

test("join captions correctly", () => {
  const captions = fixBackticks(example);
  expect(captions).toEqual([
    {
      endMs: 5.94,
      text: " `bun`",
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
    {
      endMs: 6.54,
      text: " `run`",
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
    {
      endMs: 6.96,
      text: " `dev`.",
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
    {
      endMs: 8.36,
      text: " It",
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
    {
      endMs: 8.62,
      text: " looks",
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
  ]);
});

test("does not join captions across a forced page break", () => {
  const captions = fixBackticks([
    {
      text: " `dev`",
      endMs: 6.96,
      startMs: 0,
      confidence: null,
      timestampMs: 0,
      pageBreakAfter: true,
    },
    {
      text: ". It",
      endMs: 8.36,
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
  ]);

  expect(captions).toEqual([
    {
      text: " `dev`",
      endMs: 6.96,
      startMs: 0,
      confidence: null,
      timestampMs: 0,
      pageBreakAfter: true,
    },
    {
      text: ". It",
      endMs: 8.36,
      startMs: 0,
      confidence: null,
      timestampMs: 0,
    },
  ]);
});
