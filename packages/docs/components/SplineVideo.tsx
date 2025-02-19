import { useColorMode } from "@docusaurus/theme-common";
import React from "react";

export const SplineVideo: React.FC = () => {
  const { colorMode } = useColorMode();
  return (
    <video
      src={
        colorMode === "dark"
          ? "/img/spline-guide/spline-dark.mp4"
          : "/img/spline-guide/spline-light.mp4"
      }
      autoPlay
      muted
      playsInline
      loop
    />
  );
};
