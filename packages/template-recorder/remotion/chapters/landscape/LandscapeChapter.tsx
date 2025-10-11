import React, { useMemo } from "react";
import { type Theme } from "../../../config/themes";
import type { ChapterType } from "../make-chapters";
import { ChapterTimestamp } from "./ChapterTimestamp";
import { ChapterTitle } from "./ChapterTitle";

export const CHAPTER_HEIGHT = 80;
export const CHAPTER_VERTICAL_MARGIN = 4;

export const LandscapeChapter: React.FC<{
  chapter: ChapterType;
  activeIndex: number;
  isFirstShown: boolean;
  isLastShown: boolean;
  rightAligned: boolean;
  theme: Theme;
  timestampOfLastChapter: number;
}> = ({
  chapter,
  activeIndex,
  isLastShown,
  isFirstShown,
  rightAligned,
  theme,
  timestampOfLastChapter,
}) => {
  const style: React.CSSProperties = useMemo(() => {
    return {
      display: "inline-flex",
      borderRadius: 20,
      border: "5px solid black",
      marginTop: isFirstShown ? 0 : CHAPTER_VERTICAL_MARGIN,
      marginBottom: isLastShown ? 0 : CHAPTER_VERTICAL_MARGIN,
      overflow: "hidden",
      height: CHAPTER_HEIGHT,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: rightAligned ? "row-reverse" : "row",
    };
  }, [isFirstShown, isLastShown, rightAligned]);

  return (
    <div>
      <div style={style}>
        <ChapterTimestamp
          timestampOfLastChapter={timestampOfLastChapter}
          chapter={chapter}
        />
        <ChapterTitle
          chapter={chapter}
          rightAligned={rightAligned}
          theme={theme}
          activeIndex={activeIndex}
        />
      </div>
    </div>
  );
};
