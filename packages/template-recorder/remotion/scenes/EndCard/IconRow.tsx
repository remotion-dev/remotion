import { useMemo } from "react";
import type { Platform } from "../../../config/endcard";
import { ENDCARD_FONT } from "../../../config/fonts";
import type { Theme } from "../../../config/themes";
import { COLORS } from "../../../config/themes";
import { followButtonHeight } from "./FollowButton";
import {
  GitHubIcon,
  InstagramIcon,
  LinkIcon,
  LinkedInIcon,
  XIcon,
  YouTubeIcon,
} from "./icons";

const iconContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 60,
  width: followButtonHeight,
};

const iconRow: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingTop: 20,
  paddingBottom: 20,
};

export const spaceBetweenImgAndText = 30;

export const IconRow: React.FC<{
  type: Platform | "link";
  label: string;
  opacity: number;
  theme: Theme;
}> = ({ type, label, opacity, theme }) => {
  const labelStyle: React.CSSProperties = useMemo(
    () => ({
      fontSize: 50,
      ...ENDCARD_FONT,
      marginLeft: 20,
      color: COLORS[theme].ENDCARD_TEXT_COLOR,
    }),
    [theme],
  );

  const finalLabel = useMemo(() => {
    if (label.startsWith("https://github.com/")) {
      return label.substring("https://github.com/".length);
    }

    return label;
  }, [label]);

  const finalType = useMemo(() => {
    if (label.startsWith("https://github.com/")) {
      return "github";
    }

    return type;
  }, [label, type]);

  return (
    <div style={{ ...iconRow, opacity }}>
      <div style={iconContainer}>
        {finalType === "github" ? (
          <GitHubIcon theme={theme} height={60} />
        ) : null}
        {finalType === "link" ? <LinkIcon theme={theme} height={60} /> : null}
        {finalType === "youtube" ? (
          <YouTubeIcon theme={theme} height={60} />
        ) : null}
        {finalType === "x" ? <XIcon theme={theme} height={60} /> : null}
        {finalType === "instagram" ? (
          <InstagramIcon theme={theme} height={70} />
        ) : null}
        {finalType === "linkedin" ? (
          <LinkedInIcon theme={theme} height={60} />
        ) : null}
      </div>
      <div style={{ width: spaceBetweenImgAndText }} />
      <div style={labelStyle}>{finalLabel}</div>
    </div>
  );
};
