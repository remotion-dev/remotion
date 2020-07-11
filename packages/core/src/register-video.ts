import React from "react";

let comp: React.FC | null = null;

export const getVideo = (): React.FC => {
  if (!comp) {
    throw new Error("No video was set.");
  }
  return comp;
};

export const registerVideo = (node: React.FC) => {
  comp = node;
};
