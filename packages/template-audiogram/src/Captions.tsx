import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import { ensureFont } from "./ensure-font";
import { Word } from "./Word";
import { Caption } from "@remotion/captions";

const useWindowedFrameCaptions = (
  src: Caption[],
  options: { windowStart: number; windowEnd: number },
) => {
  const { windowStart, windowEnd } = options;
  const config = useVideoConfig();
  const { fps } = config;

  return useMemo(() => {
    return src
      .map((item) => {
        const start = Math.floor((item.startMs / 1000) * fps);
        const end = Math.floor((item.endMs / 1000) * fps);
        return { item, start, end };
      })
      .filter(({ start }) => {
        return start >= windowStart && start <= windowEnd;
      })
      .map(({ item, start, end }) => {
        return {
          ...item,
          start,
          end,
        };
      }, []);
  }, [fps, src, windowEnd, windowStart]);
};

export const PaginatedCaptions: React.FC<{
  readonly captions: Caption[];
  readonly startFrame: number;
  readonly endFrame: number;
  readonly linesPerPage: number;
  readonly subtitlesTextColor: string;
  readonly subtitlesZoomMeasurerSize: number;
  readonly subtitlesLineHeight: number;
  readonly onlyDisplayCurrentSentence: boolean;
}> = ({
  startFrame,
  endFrame,
  captions,
  linesPerPage,
  subtitlesTextColor: transcriptionColor,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}) => {
  const frame = useCurrentFrame();
  const windowRef = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender());
  const [fontHandle] = useState(() => delayRender());
  const [fontLoaded, setFontLoaded] = useState(false);
  const windowedFrameSubs = useWindowedFrameCaptions(captions, {
    windowStart: startFrame,
    windowEnd: endFrame,
  });
  const currentScale = useCurrentScale();

  const [lineOffset, setLineOffset] = useState(0);

  const currentAndFollowingSentences = useMemo(() => {
    // If we don't want to only display the current sentence, return all the words
    if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

    const indexOfCurrentSentence =
      windowedFrameSubs.findLastIndex((w, i) => {
        const nextWord = windowedFrameSubs[i + 1];

        return (
          nextWord &&
          (w.text.endsWith("?") ||
            w.text.endsWith(".") ||
            w.text.endsWith("!")) &&
          nextWord.start < frame
        );
      }) + 1;

    return windowedFrameSubs.slice(indexOfCurrentSentence);
  }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

  useEffect(() => {
    if (!fontLoaded) {
      return;
    }
    const linesRendered =
      (windowRef.current?.getBoundingClientRect().height as number) /
      (subtitlesLineHeight * currentScale);
    const linesToOffset = Math.max(0, linesRendered - linesPerPage);
    setLineOffset(linesToOffset);
    continueRender(handle);
  }, [
    currentScale,
    fontLoaded,
    frame,
    handle,
    linesPerPage,
    subtitlesLineHeight,
    subtitlesZoomMeasurerSize,
  ]);

  useEffect(() => {
    ensureFont()
      .then(() => {
        continueRender(fontHandle);
        setFontLoaded(true);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [fontHandle, fontLoaded]);

  const currentFrameSentences = currentAndFollowingSentences.filter((word) => {
    return word.start < frame;
  });

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "20px",
      }}
    >
      <div
        ref={windowRef}
        style={{
          transform: `translateY(-${lineOffset * subtitlesLineHeight}px)`,
        }}
      >
        {currentFrameSentences.map((item) => (
          <span key={item.start + item.end} id={String(item.start + item.end)}>
            <Word
              frame={frame}
              item={item}
              transcriptionColor={transcriptionColor}
            />{" "}
          </span>
        ))}
      </div>
    </div>
  );
};
