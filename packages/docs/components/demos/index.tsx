import React from "react";
import { NoiseDemo } from "./NoiseDemo";

export const Demo: React.FC<{
  type: "noise";
}> = ({ type }) => {
  if (type === "noise") {
    return <NoiseDemo />;
  }

  throw new Error(`Unknown demo type: ${type}`);
};
