import React, { useMemo } from "react";
import { TITLE_FONT } from "../../../config/fonts";
import { COLORS, Theme } from "../../../config/themes";
import { ChapterType } from "../make-chapters";

export const ChapterTitle: React.FC<{
  rightAligned: boolean;
  theme: Theme;
  chapter: ChapterType;
  activeIndex: number;
}> = ({ rightAligned, theme, activeIndex, chapter }) => {
  const isCurrent = chapter.index === activeIndex;

  const textStyle: React.CSSProperties = useMemo(() => {
    return {
      padding: "0px 20px",
      fontSize: 36,
      ...TITLE_FONT,
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      right: rightAligned ? undefined : 0,
      left: rightAligned ? 0 : undefined,
    };
  }, [rightAligned]);

  return (
    <div
      style={{
        ...textStyle,
        backgroundColor: isCurrent ? COLORS[theme].ACCENT_COLOR : "white",
        padding: "0px 20px",
        color: isCurrent ? "white" : "black",
      }}
    >
      {chapter.title}
    </div>
  );
};
