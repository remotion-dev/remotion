import React, { useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { Word } from "./Word";
import { Caption } from "@remotion/captions";
import { msToFrame } from "../helpers/ms-to-frame";
import { getSentenceToDisplay } from "./sentence-to-display";
import {
  filterCurrentlyDisplayedLines,
  layoutText,
} from "./get-number-of-lines-for-text";
import { CAPTIONS_FONT_SIZE } from "./constants";
import { FONT_FAMILY } from "./font";

const useWindowedFrameCaptions = ({
  captions,
  windowStart,
  windowEnd,
}: {
  captions: Caption[];
  windowStart: number;
  windowEnd: number;
}) => {
  return useMemo(() => {
    return captions.filter(({ startMs, endMs }) => {
      return msToFrame(startMs) >= windowStart && msToFrame(endMs) <= windowEnd;
    });
  }, [captions, windowEnd, windowStart]);
};

export const PaginatedCaptions: React.FC<{
  readonly captions: Caption[];
  readonly startFrame: number;
  readonly endFrame: number;
  readonly linesPerPage: number;
  readonly subtitlesTextColor: string;
  readonly onlyDisplayCurrentSentence: boolean;
  readonly textBoxWidth: number;
}> = ({
  startFrame,
  endFrame,
  captions,
  subtitlesTextColor: transcriptionColor,
  onlyDisplayCurrentSentence,
  textBoxWidth,
}) => {
  const frame = useCurrentFrame();
  const windowRef = useRef<HTMLDivElement>(null);
  const windowedFrameSubs = useWindowedFrameCaptions({
    captions,
    windowStart: startFrame,
    windowEnd: endFrame,
  });

  const currentSentence = useMemo(() => {
    return getSentenceToDisplay({
      frame,
      onlyDisplayCurrentSentence,
      windowedFrameSubs,
    });
  }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

  const lines = useMemo(() => {
    return layoutText({
      captions: currentSentence,
      textBoxWidth,
      fontFamily: FONT_FAMILY,
      fontSize: CAPTIONS_FONT_SIZE,
    });
  }, [currentSentence, textBoxWidth]);

  const currentlyShownLines = filterCurrentlyDisplayedLines({
    lines,
    frame,
  });

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "20px",
      }}
    >
      <div ref={windowRef}>
        {currentlyShownLines.map((line) => (
          <div key={line.map((item) => item.text).join(" ")}>
            {line.map((item) => (
              <span
                key={item.startMs + item.endMs}
                id={String(item.startMs + item.endMs)}
              >
                <Word
                  frame={frame}
                  item={item}
                  transcriptionColor={transcriptionColor}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
