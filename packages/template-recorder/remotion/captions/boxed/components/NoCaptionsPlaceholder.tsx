import React, { useMemo } from "react";
import { AbsoluteFill, getRemotionEnvironment } from "remotion";
import { MONOSPACE_FONT, REGULAR_FONT } from "../../../../config/fonts";
import type { Theme } from "../../../../config/themes";
import { COLORS } from "../../../../config/themes";
import type { Layout } from "../../../layout/layout-types";

export const NoCaptionsPlaceholder: React.FC<{
  layout: Layout;
  theme: Theme;
}> = ({ layout, theme }) => {
  const style: React.CSSProperties = useMemo(() => {
    return {
      ...layout,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      color: COLORS[theme].WORD_COLOR_ON_BG_APPEARED,
      ...REGULAR_FONT,
      border: `2px ${COLORS[theme].BORDER_COLOR} solid`,
      backgroundColor: COLORS[theme].BACKGROUND,
      fontSize: 28,
      textAlign: "center",
      padding: 20,
    };
  }, [layout, theme]);

  const monospaceStyle: React.CSSProperties = useMemo(() => {
    return {
      ...MONOSPACE_FONT,
      color: COLORS[theme].ACCENT_COLOR,
      display: "inline",
    };
  }, [theme]);

  if (getRemotionEnvironment().isRendering) {
    return null;
  }

  return (
    <AbsoluteFill style={style}>
      <div>
        No captions generated for this scene.
        <br /> Run <code style={monospaceStyle}>bun sub.ts</code> to generate
        captions.
      </div>
    </AbsoluteFill>
  );
};
