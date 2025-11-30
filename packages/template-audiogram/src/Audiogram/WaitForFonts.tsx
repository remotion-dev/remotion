import { useState, useEffect } from "react";
import { cancelRender, useDelayRender } from "remotion";
import { waitForFonts } from "./font";

export const WaitForFonts: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender("<WaitForFonts> component"));

  useEffect(() => {
    return () => {
      continueRender(handle);
    };
  }, [handle, continueRender]);

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
  }, [fontsLoaded, continueRender, handle, delayRender]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
};
