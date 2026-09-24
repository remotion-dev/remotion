import { StaticFile } from "@remotion/studio";
import React from "react";
import { useRemotionEnvironment } from "remotion";
import { Theme } from "../../../../config/themes";
import { CaptionOverlay } from "../../editor/CaptionOverlay";
import { SrtPreview } from "./SrtPreview";

export const SrtPreviewAndEditor: React.FC<{
  captions: StaticFile;
  theme: Theme;
  startFrame: number;
}> = ({ captions, startFrame, theme }) => {
  const env = useRemotionEnvironment();
  // During rendering, you will get the actual .srt file instead of the preview.
  if (env.isRendering) {
    return null;
  }

  return (
    <CaptionOverlay file={captions} theme={theme} trimStart={startFrame}>
      <SrtPreview startFrame={startFrame}></SrtPreview>
    </CaptionOverlay>
  );
};
