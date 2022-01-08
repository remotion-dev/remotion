import { MINIMUM_FRAMES_PER_LAMBDA } from "@remotion/lambda/dist/defaults";
import React from "react";

export const MinimumFramesPerLambda: React.FC = () => {
  return <code>{MINIMUM_FRAMES_PER_LAMBDA}</code>;
};

export const DefaultFramesPerLambda: React.FC = () => {
  return (
    <span>
      <code />
    </span>
  );
};
