import React from "react";
import { AbsoluteFill } from "remotion";
import type { Theme } from "../../../config/themes";
import { COLORS } from "../../../config/themes";

const border = 6;

// Assuming 1080p, values upscaled from 720p
const YOUTUBE_END_SCREEN_SAFE_AREA_HEIGHT = 790;
const YOUTUBE_END_SCREEN_SAFE_AREA_TOP = 135;

const ThumbnailPreview: React.FC<{
  theme: Theme;
}> = ({ theme }) => {
  return (
    <div
      style={{
        width: 613 + border * 3,
        height: 343 + border * 3,
        border: `${border}px solid ${COLORS[theme].ENDCARD_TEXT_COLOR}`,
      }}
    />
  );
};

export const ThumbnailContainers: React.FC<{
  theme: Theme;
}> = ({ theme }) => {
  // These thumbnails are optimized for YouTube and fit perfectly if:
  // - All thumbnails are made the minimum size
  // - The upper thumbnail is positioned at the highest point allowed
  // - The lower thumbnail is positioned a the lowest point allowed
  // Use the endscreen editor in YouTube Studio to get a better feeling for this.
  return (
    <AbsoluteFill
      style={{
        alignItems: "flex-end",
        paddingRight: 100,
        top: YOUTUBE_END_SCREEN_SAFE_AREA_TOP,
      }}
    >
      <div
        style={{
          height: YOUTUBE_END_SCREEN_SAFE_AREA_HEIGHT,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ThumbnailPreview theme={theme} />
        <div style={{ flex: 1 }} />
        <ThumbnailPreview theme={theme} />
      </div>
    </AbsoluteFill>
  );
};
