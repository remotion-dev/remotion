import { Caption } from "@remotion/captions";
import React, { useContext, useMemo } from "react";

const useCaptionOverlay = (): {
  isOpen: Caption | false;
  setOpen: React.Dispatch<React.SetStateAction<Caption | false>>;
} => {
  const ctx = useContext(context);

