import { Caption } from "@remotion/captions";
import React, { useContext } from "react";

export type CaptionsContextType = {
  captions: Caption[] | null;
  setCaptions: (captions: Caption[] | null) => void;
};

const context = React.createContext<CaptionsContextType>({
  captions: null,
  setCaptions: () => {
    throw new Error("React Context not initialized");
  },
});

export const useCaptions = (): Caption[] => {
  const ctx = useContext(context);

  if (!ctx.captions) {
    throw new Error("Should not render without a captions");
  }

  return ctx.captions;
};

export const CaptionsProvider: React.FC<{
  children: React.ReactNode;
  state: CaptionsContextType;
}> = ({ children, state }) => {
  return <context.Provider value={state}>{children}</context.Provider>;
};
