import { useState, useEffect } from "react";
import { delayRender, continueRender, cancelRender } from "remotion";

export const WaitForFonts: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [handle] = useState(() => delayRender("<WaitForFonts> component"));

  useEffect(() => {
    return () => {
      continueRender(handle);
    };
  }, [handle]);

  useEffect(() => {
    const delay = delayRender("Waiting for fonts to be loaded");

    WaitForFonts()
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
