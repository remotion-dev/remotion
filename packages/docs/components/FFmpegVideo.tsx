import { useColorMode } from "@docusaurus/theme-common";
import React from "react";

export const FfmpegVideo: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <video
      src={
        colorMode === "dark"
          ? "/img/ffmpegauto-dark.mp4"
          : "/img/ffmpegauto.mp4"
      }
      autoPlay
      muted
      playsInline
      loop
    />
  );
};
