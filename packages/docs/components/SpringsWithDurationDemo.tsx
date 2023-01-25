import { useColorMode } from "@docusaurus/theme-common";
import React from "react";

export const SpringsWithDurationDemo: React.FC = () => {
  const { isDarkTheme } = useColorMode();
  return (
    <video
      src={isDarkTheme ? "/img/springs-dark.mp4" : "/img/springs-light.mp4"}
      loop
      muted
      autoPlay
    />
  );
};
