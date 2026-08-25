import React, { Fragment, useMemo } from "react";
import type { Theme } from "../../../../config/themes";
import { getHorizontalPaddingForSubtitles } from "../../processing/layout-captions";
import type { CaptionPage } from "../../types";
import { BoxedSingleCaption } from "./SingleCaption";

export const LINE_HEIGHT = 1.2;

export const SquareSubtitles: React.FC<{
  segment: CaptionPage;
  startFrame: number;
  theme: Theme;
  fontSize: number;
  lines: number;
}> = ({ segment, startFrame, theme, fontSize, lines }) => {
  const container: React.CSSProperties = useMemo(() => {
    return {
      height: lines * fontSize * LINE_HEIGHT,
    };
  }, [lines, fontSize]);

  const style: React.CSSProperties = useMemo(() => {
    return {
      lineHeight: LINE_HEIGHT,
      display: "inline-block",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
      paddingLeft: getHorizontalPaddingForSubtitles(),
      paddingRight: getHorizontalPaddingForSubtitles(),
      wordBreak: "break-word",
      width: "100%",
    };
  }, []);

  return (
    <div style={container}>
      <span style={style}>
        {segment.captions.map((caption, index) => {
          return (
            <Fragment key={caption.startMs + caption.text + index}>
              <BoxedSingleCaption
                isLast={index === segment.captions.length - 1}
                caption={caption}
                theme={theme}
                startFrame={startFrame}
              />
              {caption.lineBreakAfter && index < segment.captions.length - 1 ? (
                <br />
              ) : null}
            </Fragment>
          );
        })}
      </span>
    </div>
  );
};
