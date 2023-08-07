import { useColorMode } from "@docusaurus/theme-common";
import React from "react";

export const FfmpegVideo: React.FC = () => {
  const { isDarkTheme } = useColorMode();
  return (
    <video
      src={isDarkTheme ? "/img/ffmpegauto-dark.mp4" : "/img/ffmpegauto.mp4"}
      autoPlay
      muted
      playsInline
      loop
    />
  );
};
