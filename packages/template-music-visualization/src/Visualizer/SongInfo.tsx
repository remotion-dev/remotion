import { Img } from "remotion";

const imageContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 40,
  background: "rgba(255, 255, 255, 0.02)",
  padding: 32,
  borderRadius: 32,
  boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
};

const imageStyle: React.CSSProperties = {
  width: 280,
  height: 280,
  objectFit: "cover",
  borderRadius: 20,
  boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
};

import { useMemo } from "react";
import { BOLD_FONT_WEIGHT, MEDIUM_FONT_WEIGHT } from "../helpers/font";

export const SongInfo: React.FC<{
  coverImageUrl: string;
  songName: string;
  artistName: string;
  textColor: string;
}> = ({ coverImageUrl, songName, artistName, textColor }) => {
  const songNameStyle = useMemo(
    () => ({
      fontSize: "5.5rem",
      fontWeight: BOLD_FONT_WEIGHT,
      marginBottom: 16,
      lineHeight: "1.1",
      color: textColor,
      letterSpacing: "-0.02em",
      textShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    }),
    [textColor],
  );

  const artistNameStyle = useMemo(
    () => ({
      fontSize: "3.5rem",
      fontWeight: MEDIUM_FONT_WEIGHT,
      opacity: 0.9,
      color: textColor,
      textShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    }),
    [textColor],
  );

  return (
    <div style={imageContainerStyle}>
      <Img style={imageStyle} src={coverImageUrl} />
      <div>
        <div style={songNameStyle}>{songName}</div>
        <div style={artistNameStyle}>{artistName}</div>
      </div>
    </div>
  );
};
