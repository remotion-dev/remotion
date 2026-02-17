import React, { useEffect, useState } from "react";
import { cancelRender, useDelayRender } from "remotion";
import { waitForFonts } from "../../config/fonts";

// Missing fonts can influence the layout calculation
// and cause the subtitles to be misaligned.

// Use this component to only mount components once all fonts are loaded
export const WaitForFonts: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() =>
    delayRender("Waiting for fonts to be loaded"),
  );

  useEffect(() => {
    if (fontsLoaded) {
      return;
    }

    waitForFonts()
      .then(() => {
        setFontsLoaded(true);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [fontsLoaded, handle, continueRender, delayRender]);

  useEffect(() => {
    if (fontsLoaded) {
      continueRender(handle);
    }
  }, [continueRender, fontsLoaded, handle]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
};
