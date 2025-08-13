import React from "react";
import { AbsoluteFill } from "remotion";
import { TITLE_FONT } from "../../../config/fonts";
import type { Theme } from "../../../config/themes";
import { COLORS } from "../../../config/themes";

export const Title: React.FC<{
  title: string;
  subtitle: string | null;
  theme: Theme;
}> = ({ subtitle, title, theme }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 30,
        paddingRight: 30,
      }}
    >
      <div
        style={{
          ...TITLE_FONT,
          fontSize: 60,
          color: COLORS[theme].WORD_COLOR_ON_BG_APPEARED,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {title}
      </div>
      {subtitle?.trim() === "" ? null : (
        <div
          style={{
            fontSize: 40,
            // TODO: Introduce a subtitle color in the theme
            color: COLORS[theme].ENDCARD_TEXT_COLOR,
            ...TITLE_FONT,
            marginTop: 10,
            textAlign: "center",
            textWrap: "balance",
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
