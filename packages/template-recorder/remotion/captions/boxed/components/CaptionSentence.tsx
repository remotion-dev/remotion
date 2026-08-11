import { Caption } from "@remotion/captions";
import React from "react";
import {
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Theme } from "../../../../config/themes";
import type { CaptionPage } from "../../types";
import { LINE_HEIGHT, SquareSubtitles } from "./SquareSubtitles";

const getStartOfSegment = (segment: CaptionPage) => {
  if (segment.captions.length === 0) {
    return 0;
  }

  return (segment.captions[0] as Caption).startMs;
};

const getEndOfSegment = (segment: CaptionPage) => {
  if (segment.captions.length === 0) {
    return 0;
  }

  return (segment.captions[segment.captions.length - 1] as Caption).endMs;
};

export const getSubtitlesFontSize = () => {
  return 56;
};

export const getSubtitlesLines = ({
  boxHeight,
  fontSize,
}: {
  boxHeight: number;
  fontSize: number;
}) => {
  const boxPadding = 50;

  const nrOfLines = Math.floor(
    (boxHeight - boxPadding) / (fontSize * LINE_HEIGHT),
  );
  return nrOfLines;
};

export const getBorderWidthForSubtitles = () => {
  return 3;
};

const FadeSentence: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 5, Math.max(6, durationInFrames - 5), Math.max(7, durationInFrames)],
    [0, 1, 1, 0],
    {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    },
  );

  return <div style={{ opacity }}>{children}</div>;
};

export const CaptionSentence: React.FC<{
  segment: CaptionPage;
  isFirst: boolean;
  isLast: boolean;
  trimStart: number;
  theme: Theme;
  fontSize: number;
  lines: number;
}> = ({ segment, trimStart, isFirst, isLast, theme, fontSize, lines }) => {
  const { fps } = useVideoConfig();
  const normalStartFrame = (getStartOfSegment(segment) / 1000) * fps;
  // If first caption of a segment, show it a bit earlier to avoid flicker
  // of caption showing only shortly after the video
  const startFrame = isFirst ? normalStartFrame - fps : normalStartFrame;
  const endSegment = getEndOfSegment(segment);
  const normalEndFrame = endSegment === null ? null : (endSegment / 1000) * fps;
  const endFrame =
    normalEndFrame === null
      ? null
      : isLast
        ? normalEndFrame + fps
        : normalEndFrame;

  return (
    <Sequence
      showInTimeline={false}
      from={startFrame - trimStart}
      durationInFrames={endFrame === null ? undefined : endFrame - startFrame}
      layout="none"
    >
      <FadeSentence>
        <SquareSubtitles
          segment={segment}
          startFrame={startFrame}
          theme={theme}
          fontSize={fontSize}
          lines={lines}
        />
      </FadeSentence>
    </Sequence>
  );
};
