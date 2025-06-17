import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { waitForFonts } from "../../config/fonts";

// Missing fonts can influence the layout calculation
// and cause the subtitles to be misaligned.

// Use this component to only mount components once all fonts are loaded
export const WaitForFonts: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    const delay = delayRender("Waiting for fonts to be loaded");

    waitForFonts()
      .then(() => {
        continueRender(handle);
        continueRender(delay);
        setFontsLoaded(true);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [fontsLoaded, handle]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
};
