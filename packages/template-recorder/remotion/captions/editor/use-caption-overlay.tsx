import { Caption } from "@remotion/captions";
import React, { useContext, useMemo } from "react";

type CaptionOverlayContext = {
  open: Caption | false;
  setOpen: React.Dispatch<React.SetStateAction<Caption | false>>;
};

const context = React.createContext<CaptionOverlayContext>({
  open: false,
  setOpen: () => {
    throw new Error("React Context not initialized");
  },
});

export const useCaptionOverlay = (): {
  isOpen: Caption | false;
  setOpen: React.Dispatch<React.SetStateAction<Caption | false>>;
} => {
  const ctx = useContext(context);

  return useMemo(
    () => ({ isOpen: ctx.open, setOpen: ctx.setOpen }),
    [ctx.open, ctx.setOpen],
  );
};

export const CaptionOverlayProvider: React.FC<{
  children: React.ReactNode;
  state: CaptionOverlayContext;
}> = ({ children, state }) => {
  return <context.Provider value={state}>{children}</context.Provider>;
};
